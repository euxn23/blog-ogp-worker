import { CSSProperties } from 'react';

export const Preview = (({ text }) => (
  <div style={s.container}>
    <div style={s.containerAfter} />
    <div style={s.title}>{text}</div>
    <div style={s.footer}>blog.euxn.me</div>
  </div>
)) satisfies React.FC<{ text: string }>

const s: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to right bottom, #383f4a 0%, #383f4a 50%, #272f39 50%, #272f39 100%)',
  },
  containerAfter: {
    position: 'absolute',
    height: '50%',
    width: '100%',
    top: '50%',
    left: 0,
    display: 'flex',
    background: 'linear-gradient(to right top, #171f29 0%, #171f29 50%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 100%)',
    zIndex: 1,
  },
  title: {
    display: 'flex',
    margin: 0,
    marginRight: 96,
    marginLeft: 96,
    padding: 0,
    color: 'white',
    fontSize: '76px',
  },
  footer: {
    display: 'flex',
    margin: 0,
    padding: 0,
    color: 'white',
    fontSize: '24px',
  }
}