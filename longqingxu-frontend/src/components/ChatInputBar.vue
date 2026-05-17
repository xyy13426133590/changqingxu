<template>
  <view class="chat-input-bar">
    <!-- 第一行：工具（半透明圆点，融进渐变底） -->
    <view class="toolbar-row">
      <view
        class="tb-btn"
        :class="{ on: mode === 'voice' }"
        @click="toggleMode('voice')"
      >
        <text>{{ mode === 'voice' ? '⌨️' : '🎙️' }}</text>
      </view>
      <view class="tb-btn" :class="{ on: showEmoji }" @click="toggleEmoji">
        <text>😊</text>
      </view>
      <view class="tb-btn" @click="chooseAlbum">
        <text>🖼️</text>
      </view>
      <view class="tb-btn" @click="chooseImage">
        <text>📷</text>
      </view>
      <view class="tb-btn" @click="takeScreenshot">
        <text>✂️</text>
      </view>
    </view>

    <!-- 第二行：输入（与背景同系浅色玻璃） -->
    <view class="composer-row">
      <view
        v-if="mode === 'voice'"
        class="voice-hold"
        :class="{ recording: isRecording, cancelling: willCancel }"
        @touchstart="onVoiceStart"
        @touchmove="onVoiceMove"
        @touchend="onVoiceEnd"
        @touchcancel="onVoiceCancel"
      >
        <text class="voice-text">{{ voiceBtnText }}</text>
      </view>
      <template v-else>
        <textarea
          v-model="inputText"
          class="input-textarea"
          :placeholder="placeholder"
          :maxlength="500"
          auto-height
          confirm-type="send"
          @confirm="sendText"
          @focus="onFocus"
        />
        <view class="send-btn" :class="{ on: canSend }" @click="sendText">
          <text>➤</text>
        </view>
      </template>
    </view>

    <!-- 录音中遮罩 -->
    <view v-if="isRecording" class="voice-overlay">
      <view class="voice-panel" :class="{ cancelling: willCancel }">
        <view class="voice-wave">
          <view v-for="i in 5" :key="i" class="wave-bar" :style="waveStyle(i)"></view>
        </view>
        <text class="voice-hint">{{ willCancel ? '松开取消发送' : '松开发送，上滑取消' }}</text>
        <text class="voice-time">{{ formatRecordTime }}</text>
      </view>
    </view>

    <EmojiPanel v-if="showEmoji" :visible="showEmoji" @select="onEmojiSelect" @delete="onEmojiDelete" />

    <view v-if="editingImage" class="image-edit-overlay">
      <view class="image-edit-panel">
        <view class="edit-header">
          <text @click="cancelEdit">取消</text>
          <text class="edit-title">图片编辑</text>
          <text class="edit-confirm" @click="confirmEdit">发送</text>
        </view>
        <image class="edit-preview" :src="editingImage" mode="aspectFit" />
        <view class="edit-tools">
          <view class="tool-item" @click="rotateImage">
            <text>↻</text>
            <text class="tool-label">旋转</text>
          </view>
          <view class="tool-item" @click="cropImage">
            <text>✂️</text>
            <text class="tool-label">裁剪</text>
          </view>
          <view class="tool-item" @click="addText">
            <text>T</text>
            <text class="tool-label">文字</text>
          </view>
          <view class="tool-item" @click="addMosaic">
            <text>▦</text>
            <text class="tool-label">马赛克</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EmojiPanel from './EmojiPanel.vue'
// #ifndef MP-WEIXIN
import { cropCenterSquareToDataUrl } from '@/utils/image-crop'
// #endif

defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{
  sendText: [content: string]
  sendVoice: [duration: number, tempFilePath: string]
  sendImage: [tempFilePath: string]
}>()

const mode = ref<'text' | 'voice'>('text')
const inputText = ref('')
const showEmoji = ref(false)
const canSend = computed(() => inputText.value.trim().length > 0)

const isRecording = ref(false)
const willCancel = ref(false)
const recordStartTime = ref(0)
const recordDuration = ref(0)
const recordTimer = ref<ReturnType<typeof setInterval> | null>(null)
const editingImage = ref('')

// #ifdef MP-WEIXIN
/** 与 RecorderManager.onStop 对齐：stop() 后才会有 tempFilePath */
type PendingVoiceStop = { cancelled: boolean; startMs: number }
let pendingVoiceStop: PendingVoiceStop | null = null
let recorderManagerInited = false
// #endif

const voiceBtnText = computed(() => {
  if (isRecording.value) return willCancel.value ? '松开取消' : '录音中…'
  return '按住 说话'
})

const formatRecordTime = computed(() => {
  const seconds = Math.floor(recordDuration.value / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

function toggleMode(targetMode: 'text' | 'voice') {
  mode.value = mode.value === targetMode ? 'text' : targetMode
  showEmoji.value = false
}

function toggleEmoji() {
  showEmoji.value = !showEmoji.value
  if (showEmoji.value) mode.value = 'text'
}

function onFocus() {
  showEmoji.value = false
}

function sendText() {
  const content = inputText.value.trim()
  if (!content) return
  emit('sendText', content)
  inputText.value = ''
}

function onEmojiSelect(emoji: string) {
  inputText.value += emoji
}

function onEmojiDelete() {
  const str = inputText.value
  if (str.length === 0) return
  inputText.value = str.slice(0, -1)
}

// #ifdef MP-WEIXIN
/** 申请录音权限；需在 manifest 「scope.record」中声明用途，否则易出现「录音失败」 */
function ensureRecordPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success(setting) {
        if (setting.authSetting?.['scope.record'] === true) {
          resolve(true)
          return
        }
        uni.authorize({
          scope: 'scope.record',
          success() {
            resolve(true)
          },
          fail() {
            uni.showModal({
              title: '需要录音权限',
              content: '请在设置中允许「麦克风/录音」，以便发送语音。',
              cancelText: '取消',
              confirmText: '去设置',
              success(r) {
                if (r.confirm) uni.openSetting({})
              },
            })
            resolve(false)
          },
        })
      },
      fail() {
        resolve(false)
      },
    })
  })
}

function toastRecorderError(err: { errMsg?: string }): void {
  console.warn('[RecorderManager]', err)
  const msg = (err.errMsg || '').toLowerCase()
  let title = '录音失败'
  if (msg.includes('auth') || msg.includes('denied') || msg.includes('authorize') || msg.includes('privacy')) {
    title = '未获得录音权限，请去设置开启'
  } else if (
    msg.includes('not supported') ||
    msg.includes('not support') ||
    msg.includes('simulate') ||
    msg.includes('simulator')
  ) {
    title = '开发者工具可能无麦克风，请用真机试'
  } else if (msg.includes('frequency') || msg.includes('bitrate') || msg.includes('samplerate')) {
    title = '当前设备不支持该录音参数，可在真机再试'
  } else if (msg.length > 3 && msg.length <= 56) {
    title = msg
  }
  uni.showToast({ title, icon: 'none', duration: 2800 })
}

function recorderStartMp3Compatible(rm: UniApp.RecorderManager): void {
  rm.start({
    duration: 60000,
    format: 'mp3',
    sampleRate: 16000,
    numberOfChannels: 1,
  })
}

// #endif

async function onVoiceStart() {
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '语音录制仅支持微信小程序', icon: 'none' })
  return
  // #endif
  // #ifdef MP-WEIXIN
  const permitted = await ensureRecordPermission()
  if (!permitted) return

  initRecorderManagerOnce()
  const rm = uni.getRecorderManager?.()
  if (!rm) {
    uni.showToast({ title: '录音组件不可用', icon: 'none' })
    return
  }

  isRecording.value = true
  willCancel.value = false
  recordStartTime.value = Date.now()
  recordDuration.value = 0
  recordTimer.value = setInterval(() => {
    recordDuration.value = Date.now() - recordStartTime.value
  }, 100)
  startRecord()
  // #endif
}

function onVoiceMove(e: TouchEvent) {
  if (!isRecording.value) return
  const touch = e.touches[0]
  const ct = e.currentTarget as { startY?: number }
  const startY = ct.startY != null ? ct.startY : touch.clientY
  ;(e.currentTarget as { startY?: number }).startY = startY
  const deltaY = startY - touch.clientY
  willCancel.value = deltaY > 100
}

function onVoiceEnd() {
  if (!isRecording.value) return
  // #ifdef MP-WEIXIN
  const cancelled = willCancel.value
  const startMs = recordStartTime.value
  pendingVoiceStop = { cancelled, startMs }
  if (recordTimer.value) {
    clearInterval(recordTimer.value)
    recordTimer.value = null
  }
  isRecording.value = false
  willCancel.value = false
  recordDuration.value = 0
  uni.getRecorderManager?.()?.stop()
  // #endif
}

function onVoiceCancel() {
  // #ifdef MP-WEIXIN
  if (!isRecording.value) return
  pendingVoiceStop = { cancelled: true, startMs: recordStartTime.value }
  if (recordTimer.value) {
    clearInterval(recordTimer.value)
    recordTimer.value = null
  }
  isRecording.value = false
  willCancel.value = false
  recordDuration.value = 0
  uni.getRecorderManager?.()?.stop()
  // #endif
}

function startRecord() {
  // #ifdef MP-WEIXIN
  initRecorderManagerOnce()
  const rm = uni.getRecorderManager?.()
  if (!rm) return
  recorderStartMp3Compatible(rm)
  // #endif
}

function resetRecordState() {
  isRecording.value = false
  willCancel.value = false
  recordDuration.value = 0
  if (recordTimer.value) {
    clearInterval(recordTimer.value)
    recordTimer.value = null
  }
}

// #ifdef MP-WEIXIN
function initRecorderManagerOnce() {
  if (recorderManagerInited) return
  const rm = uni.getRecorderManager?.()
  if (!rm) return
  recorderManagerInited = true
  rm.onStop((res) => {
    if (recordTimer.value) {
      clearInterval(recordTimer.value)
      recordTimer.value = null
    }
    const pend = pendingVoiceStop
    pendingVoiceStop = null

    if (!pend) {
      resetRecordState()
      return
    }

    if (pend.cancelled) {
      resetRecordState()
      return
    }

    const duration = Date.now() - pend.startMs
    const path = (res.tempFilePath || '').trim()
    resetRecordState()

    if (duration < 1000) {
      uni.showToast({ title: '录音时间太短', icon: 'none' })
      return
    }
    if (!path) {
      uni.showToast({ title: '未获取录音文件', icon: 'none' })
      return
    }
    emit('sendVoice', duration, path)
  })

  rm.onError((err: { errMsg?: string }) => {
    pendingVoiceStop = null
    resetRecordState()
    toastRecorderError(err || {})
  })
}
// #endif

onMounted(() => {
  // #ifdef MP-WEIXIN
  initRecorderManagerOnce()
  // #endif
})

function waveStyle(index: number) {
  const height = isRecording.value
    ? 20 + Math.sin(Date.now() / 100 + index) * 20
    : 10
  return {
    height: `${height}rpx`,
    animationDelay: `${index * 0.1}s`,
  }
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: (res) => {
      editingImage.value = res.tempFilePaths[0]
    },
  })
}

function chooseAlbum() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      editingImage.value = res.tempFilePaths[0]
    },
  })
}

function takeScreenshot() {
  uni.showModal({
    title: '选择图片',
    content: '拍照或从相册选择，进入编辑后发送',
    confirmText: '拍摄',
    cancelText: '相册',
    success: (res) => {
      if (res.confirm) chooseImage()
      else chooseAlbum()
    },
  })
}

function cancelEdit() {
  editingImage.value = ''
}

function confirmEdit() {
  if (editingImage.value) {
    emit('sendImage', editingImage.value)
    editingImage.value = ''
  }
}

function rotateImage() {
  uni.showToast({ title: '旋转需接入图片编辑能力', icon: 'none' })
}

async function cropImage() {
  const src = editingImage.value
  if (!src) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }
  // #ifdef MP-WEIXIN
  uni.cropImage({
    src,
    cropScale: '1:1',
    success(res) {
      editingImage.value = res.tempFilePath
      uni.showToast({ title: '裁剪完成', icon: 'success' })
    },
    fail(err) {
      console.warn('[cropImage]', err)
      uni.showToast({ title: '系统裁剪不可用，请升级微信', icon: 'none' })
    },
  })
  // #endif
  // #ifndef MP-WEIXIN
  try {
    uni.showLoading({ title: '处理中', mask: true })
    const url = await cropCenterSquareToDataUrl(src)
    editingImage.value = url
    uni.hideLoading()
    uni.showToast({ title: '已居中裁剪为方形', icon: 'success' })
  } catch (e) {
    uni.hideLoading()
    console.error(e)
    uni.showToast({ title: '裁剪失败，请换张图试试', icon: 'none' })
  }
  // #endif
}

function addText() {
  uni.showModal({
    title: '添加文字',
    editable: true,
    placeholderText: '输入文字',
    success: (res) => {
      if (res.confirm && res.content) {
        uni.showToast({ title: `已记录: ${res.content}`, icon: 'none' })
      }
    },
  })
}

function addMosaic() {
  uni.showToast({ title: '马赛克需图像处理库', icon: 'none' })
}

onUnmounted(() => {
  if (recordTimer.value) clearInterval(recordTimer.value)
})
</script>

<style scoped lang="scss">
/* 与 page gradient-bg 同系：#c4b5fd → #a5b4fc → #93c5fd，只做极轻叠层，避免白块/强紫 */
.chat-input-bar {
  position: relative;
  z-index: 50;
  padding: 10rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: linear-gradient(
    180deg,
    rgba(196, 181, 253, 0) 0%,
    rgba(165, 180, 252, 0.22) 45%,
    rgba(147, 197, 253, 0.32) 100%
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1rpx solid rgba(255, 255, 255, 0.32);
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28rpx;
  padding: 8rpx 0 14rpx;
}

.tb-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.26);
  border: 1rpx solid rgba(255, 255, 255, 0.38);
  transition: background 0.15s ease, transform 0.12s ease;

  text {
    font-size: 34rpx;
    line-height: 1;
  }

  &:active {
    transform: scale(0.94);
  }

  &.on {
    background: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.55);
  }
}

.composer-row {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
}

.input-textarea {
  flex: 1;
  min-width: 0;
  min-height: 76rpx;
  max-height: 200rpx;
  padding: 16rpx 22rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.34);
  border: 1rpx solid rgba(255, 255, 255, 0.42);
  border-radius: 20rpx;
  font-size: 30rpx;
  line-height: 1.45;
  color: #374151;
}

.voice-hold {
  flex: 1;
  min-height: 76rpx;
  padding: 18rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.34);
  border: 1rpx solid rgba(255, 255, 255, 0.42);
  border-radius: 20rpx;

  .voice-text {
    font-size: 30rpx;
    color: #4b5563;
    font-weight: 500;
    letter-spacing: 2rpx;
  }

  &.recording {
    background: rgba(255, 255, 255, 0.52);
    border-color: rgba(255, 255, 255, 0.58);
    .voice-text {
      color: #5b21b6;
    }
  }

  &.cancelling {
    background: rgba(254, 226, 226, 0.55);
    border-color: rgba(252, 165, 165, 0.65);
    .voice-text {
      color: #991b1b;
    }
  }
}

.send-btn {
  width: 76rpx;
  height: 76rpx;
  min-width: 76rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  transition: background 0.15s ease, transform 0.12s ease;

  text {
    font-size: 30rpx;
    color: #9ca3af;
    transform: translateX(2rpx);
  }

  &.on {
    background: rgba(255, 255, 255, 0.62);
    border-color: rgba(255, 255, 255, 0.72);

    text {
      color: #6d28d9;
    }
  }

  &:active {
    transform: scale(0.94);
  }

  &:not(.on) {
    pointer-events: none;
    opacity: 0.75;
  }
}

.voice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(99, 102, 241, 0.18);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.voice-panel {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 24rpx;
  padding: 44rpx 52rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 16rpx 48rpx rgba(99, 102, 241, 0.12);

  &.cancelling {
    background: rgba(254, 242, 242, 0.95);
    border-color: rgba(252, 165, 165, 0.5);
  }
}

.voice-wave {
  display: flex;
  align-items: center;
  gap: 10rpx;
  height: 88rpx;
}

.wave-bar {
  width: 8rpx;
  background: linear-gradient(180deg, #a5b4fc, #93c5fd);
  border-radius: 4rpx;
  animation: wave 0.5s ease-in-out infinite alternate;
}

@keyframes wave {
  from {
    height: 18rpx;
    opacity: 0.55;
  }
  to {
    height: 56rpx;
    opacity: 1;
  }
}

.voice-hint {
  font-size: 26rpx;
  color: #6b7280;
}

.voice-time {
  font-size: 40rpx;
  color: #4b5563;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.image-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(55, 65, 120, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.image-edit-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  color: #f9fafb;

  text {
    font-size: 28rpx;
  }

  .edit-title {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .edit-confirm {
    color: #e0e7ff;
  }
}

.edit-preview {
  flex: 1;
  width: 100%;
}

.edit-tools {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 20rpx calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 20rpx;

  text {
    font-size: 34rpx;
    color: #fff;
  }

  .tool-label {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.82);
  }
}
</style>
