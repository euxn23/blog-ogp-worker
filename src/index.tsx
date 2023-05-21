import satori, { init } from 'satori/wasm';
import initYoga from 'yoga-wasm-web';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import yogaWasm from '../node_modules/yoga-wasm-web/dist/yoga.wasm';
import resvgWasm from '../node_modules/@resvg/resvg-wasm/index_bg.wasm';
import { Preview } from './preview';

init(await initYoga(yogaWasm as WebAssembly.Module));
await initWasm(resvgWasm);

type ENV = {
  OGP_BLOG_EUXN_ME: R2Bucket
}

let fontCache: null | ArrayBuffer = null;

export default {
  fetch: async (request, env: ENV) => {
    const requestUrl = new URL(request.url);

    const title = requestUrl.searchParams.get('title')
    if (!title) {
      return new Response('Parameter not definer: title')
    }

    const cache = await fetch(`https://ogp.blog.euxn.me/cache/${title}.png`, { method: 'HEAD' });
    if (cache.status === 200) {
      return Response.redirect(`https://ogp.blog.euxn.me/cache/${title}.png`, 301)
    }

    if (!fontCache) {
      const fontObject = await env.OGP_BLOG_EUXN_ME.get(
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

    const svg = await satori(<Preview text={title}/>, {
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

    await env.OGP_BLOG_EUXN_ME.put(`cache/${title}.png`, image)

    return new Response(image, {
      headers: {
        'Content-Type': 'image/png',
      }
    });
  }
};
