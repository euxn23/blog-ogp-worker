import satori, { init } from 'satori/wasm';
import initYoga from 'yoga-wasm-web';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import yogaWasm from '../node_modules/yoga-wasm-web/dist/yoga.wasm';
import resvgWasm from '../node_modules/@resvg/resvg-wasm/index_bg.wasm';
import { Preview } from './preview';

init(await initYoga(yogaWasm as WebAssembly.Module));
await initWasm(resvgWasm);

type ENV = {
  R2: R2Bucket
  SITE_TITLE: string
  SITE_THEME: 'dark' | 'light'
  CACHE_ENDPOINT: string
}

let fontCache: null | ArrayBuffer = null;

export default {
  fetch: async (request, env: ENV) => {
    const requestUrl = new URL(request.url);

    const title = requestUrl.searchParams.get('title')
    if (!title) {
      return new Response('Parameter not definer: title')
    }
    if (title.includes('/')) {
      return new Response('Bad parameter: title', { status: 400 })
    }

    const isTwitterBot = request.headers.get('user-agent')?.includes('Twitterbot') ?? false;
    if (isTwitterBot) {
      const cache = await env.R2.get(`cache/${title}.png`);
      if (cache) {
        return new Response(cache.body, {
          headers: {
            'Cache-Status': '"Cloudflare R2"; hit',
            'Content-Type': 'image/png'
          }
        })
      }
    }

    const cache = await fetch(`${env.CACHE_ENDPOINT}/${title}.png`, { method: 'HEAD' });
    if (cache.status === 200) {
      return Response.redirect(`${env.CACHE_ENDPOINT}/${title}.png`, 301)
    }

    if (!fontCache) {
      const fontObject = await env.R2.get(
        'fonts/NotoSansJP-Regular.ttf'
      );

      if (!fontObject) {
        return new Response('Internal Server Error: font not exist.', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }

      fontCache = await fontObject.arrayBuffer();
      if (!fontCache) {
        return new Response('Internal Server Error: font not exist.', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }
    }

    const svg = await satori(<Preview siteTitle={env.SITE_TITLE} text={title} theme={env.SITE_THEME}/>, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'NotoSansJP',
          data: fontCache,
          weight: 100,
          style: 'normal'
        }
      ]
    });

    const image = (new Resvg(svg))
      .render()
      .asPng();

    await env.R2.put(`cache/${title}.png`, image)

    return new Response(image, {
      headers: {
        'Content-Type': 'image/png',
      }
    });
  }
};
