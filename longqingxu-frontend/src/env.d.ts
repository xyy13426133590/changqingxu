/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 是否启用微信云函数模式（true = callFunction，false = NestJS HTTP） */
  readonly VITE_USE_CLOUD?: string
  /** 微信云环境 ID */
  readonly VITE_CLOUD_ENV?: string
  /** NestJS API 根路径（VITE_USE_CLOUD=false 时使用） */
  readonly VITE_API_BASE_URL?: string
  /** WebSocket 根路径（VITE_USE_CLOUD=false 时使用） */
  readonly VITE_WS_BASE_URL?: string
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