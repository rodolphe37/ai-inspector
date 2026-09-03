/// <reference types="vite/client" />

declare module '*.wasm?url' {
  const src: string;
  export default src;
}

declare module 'c2pa/dist/c2pa.worker.min.js?url' {
  const src: string;
  export default src;
}
