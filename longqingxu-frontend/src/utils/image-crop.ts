/**
 * 浏览器环境：将图片居中裁成最大正方形，输出 JPEG dataURL。
 * 用于 H5 / App-Vue 等存在 document 与 Canvas 的端；小程序请优先用 uni.cropImage。
 */
export function cropCenterSquareToDataUrl(src: string, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('canvas unavailable'))
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width
        const h = img.naturalHeight || img.height
        if (!w || !h) {
          reject(new Error('invalid image size'))
          return
        }
        const side = Math.min(w, h)
        const sx = (w - side) / 2
        const sy = (h - side) / 2
        const canvas = document.createElement('canvas')
        canvas.width = side
        canvas.height = side
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('no 2d context'))
          return
        }
        ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}
