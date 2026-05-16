/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** NestJS API 根路径，如 http://localhost:3000/api */
  readonly VITE_API_BASE_URL: string
  /** WebSocket 根路径，如 ws://localhost:3000/chat */
  readonly VITE_WS_BASE_URL: string
  /** 静态资源/OSS 访问域名 */
  readonly VITE_UPLOAD_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module 'uni-app' {
  export * from '@dcloudio/uni-app'
}