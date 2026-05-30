<template>
  <view class="page-container gradient-bg">
    <view :style="capsuleNavOuterStyle">
      <view class="chat-header" :style="capsuleNavRowStyle">
        <view class="back-btn" hover-class="btn-press" @tap.stop="goBack">
          <text>‹</text>
        </view>
        <image
          class="peer-avatar"
          :src="currentConversation?.avatar"
          mode="aspectFill"
        />
        <view class="peer-info">
          <text class="nickname">{{ currentConversation?.nickname }}</text>
          <text class="safety-tip">站内信 · 请勿轻信站外转账</text>
        </view>
      </view>
    </view>

    <!-- 风险提示条 -->
    <view v-if="showRiskBanner" class="chat-risk-banner">
      <text class="risk-icon">⚠️</text>
      <text class="risk-text">
        安全提示：请勿随意添加陌生联系方式或跳转第三方平台，谨防诈骗。
      </text>
      <text class="risk-close" @click="dismissRisk">✕</text>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      class="chat-messages"
      scroll-y
      show-scrollbar="false"
      :scroll-into-view="lastMessageId"
      scroll-with-animation
    >
      <view
        v-for="msg in currentMessages"
        :key="msg.id"
        :id="msg.id"
        class="message-item"
        :class="{ me: isFromMe(msg), other: !isFromMe(msg) }"
      >
        <image
          v-if="!isFromMe(msg)"
          class="msg-avatar"
          :src="currentConversation?.avatar"
          mode="aspectFill"
        />

        <!-- 文字消息 -->
        <view
          v-if="msg.type === 'text'"
          class="message-bubble"
          :class="isFromMe(msg) ? 'me' : 'other'"
        >
          <text>{{ msg.content }}</text>
          <view v-if="isFromMe(msg)" class="msg-status">
            <text v-if="msg.status === 'sending'">◌</text>
            <text v-else-if="msg.status === 'sent'">✓</text>
            <text v-else>✓✓</text>
          </view>
        </view>

        <!-- 图片消息 -->
        <view
          v-else-if="msg.type === 'image'"
          class="message-bubble image-bubble"
          :class="isFromMe(msg) ? 'me' : 'other'"
          @click="previewImage(msg.content)"
        >
          <image class="msg-image" :src="msg.content" mode="widthFix" />
          <view v-if="isFromMe(msg)" class="msg-status">
            <text v-if="msg.status === 'sending'">◌</text>
            <text v-else-if="msg.status === 'sent'">✓</text>
            <text v-else>✓✓</text>
          </view>
        </view>

        <!-- 语音消息 -->
        <view
          v-else-if="msg.type === 'voice'"
          class="message-bubble voice-bubble"
          :class="isFromMe(msg) ? 'me' : 'other'"
          @click.stop="playVoice(msg)"
        >
          <view class="voice-content">
            <text class="voice-icon">{{ playingVoiceId === msg.id ? '🔊' : '▶️' }}</text>
            <text class="voice-duration">{{ formatDuration(msg.duration) }}"</text>
          </view>
          <view class="voice-wave-preview">
            <view v-for="i in 5" :key="i" class="voice-bar" :style="{ height: `${Math.random() * 30 + 10}rpx` }"></view>
          </view>
          <view v-if="isFromMe(msg)" class="msg-status">
            <text v-if="msg.status === 'sending'">◌</text>
            <text v-else-if="msg.status === 'sent'">✓</text>
            <text v-else>✓✓</text>
          </view>
        </view>

        <!-- Emoji 表情消息 -->
        <view
          v-else-if="msg.type === 'emoji'"
          class="message-bubble emoji-bubble"
          :class="isFromMe(msg) ? 'me' : 'other'"
        >
          <text class="emoji-content">{{ msg.content }}</text>
          <view v-if="isFromMe(msg)" class="msg-status">
            <text v-if="msg.status === 'sending'">◌</text>
            <text v-else-if="msg.status === 'sent'">✓</text>
            <text v-else>✓✓</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区 - 使用新的 ChatInputBar 组件 -->
    <ChatInputBar
      placeholder="文明发言，涉及站外引导将提示风险…"
      @send-text="onSendText"
      @send-voice="onSendVoice"
      @send-image="onSendImage"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useMessagesStore, type Message } from '@/stores/messages'
import { useUserStore } from '@/stores/user'
import ChatInputBar from '@/components/ChatInputBar.vue'
import { connectChatSocket, disconnectChatSocket } from '@/services/chat-socket'
import { startMessageWatch, stopMessageWatch } from '@/services/message-watch'
import { USE_CLOUD } from '@/services/cloud'
import { navigateBackTo } from '@/utils/navigation'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'
import { resolveVoicePlaySrc } from '@/utils/media-url'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())

const messagesStore = useMessagesStore()
const userStore = useUserStore()
const showRiskBanner = ref(true)
const conversationId = ref('')
const playingVoiceId = ref('')

let voicePlayer: UniApp.InnerAudioContext | null = null

function stopVoicePlayback(): void {
  playingVoiceId.value = ''
  if (!voicePlayer) return
  try {
    voicePlayer.stop()
    voicePlayer.destroy()
  } catch {
    /* ignore */
  }
  voicePlayer = null
}

function isFromMe(msg: { senderId: string }): boolean {
  const my = userStore.profile.id
  return msg.senderId === '__local__' || (!!my && msg.senderId === my)
}

const currentConversation = computed(() => messagesStore.currentConversation)
const currentMessages = computed(() => messagesStore.currentMessages)
const lastMessageId = computed(() => {
  const list = currentMessages.value
  if (list.length === 0) return ''
  return list[list.length - 1].id
})

onLoad(async (options) => {
  if (options?.conversationId) {
    conversationId.value = options.conversationId
    await messagesStore.setCurrentConversation(options.conversationId)
    await messagesStore.loadMessages(options.conversationId)
  }
  if (USE_CLOUD) {
    startMessageWatch(conversationId.value, (msg) => {
      messagesStore.applyIncomingMessage(msg)
    })
  } else {
    await connectChatSocket({
      onNewMessage: (payload) => messagesStore.applyIncomingMessage(payload as any),
    })
  }
})

onUnload(() => {
  stopVoicePlayback()
  if (USE_CLOUD) {
    stopMessageWatch()
  } else {
    void disconnectChatSocket()
  }
})

function goBack() {
  navigateBackTo('/pages/messages/index')
}

// 关闭风险提示
function dismissRisk() {
  showRiskBanner.value = false
}

// 发送文字消息
function onSendText(content: string) {
  messagesStore.sendMessage(content, 'text')
  scrollToBottom()
}

// 发送语音消息
function onSendVoice(duration: number, tempFilePath: string) {
  const voiceData = JSON.stringify({
    url: tempFilePath,
    duration: duration,
  })
  messagesStore.sendMessage(voiceData, 'voice', { duration })
  scrollToBottom()
}

// 发送图片消息
function onSendImage(tempFilePath: string) {
  messagesStore.sendMessage(tempFilePath, 'image')
  scrollToBottom()
}

// 自动滚动到底部
function scrollToBottom() {
  nextTick(() => {
    const lastId = lastMessageId.value
    if (lastId) {
      // scroll-view 会自动滚动到 scroll-into-view 指定的元素
    }
  })
}

// 预览图片
function previewImage(url: string) {
  uni.previewImage({
    urls: [url],
    current: url,
  })
}

// 播放语音
async function playVoice(msg: Message) {
  if (msg.type !== 'voice') return

  if (playingVoiceId.value === msg.id) {
    stopVoicePlayback()
    return
  }

  let rawUrl = ''
  try {
    const data = JSON.parse(msg.content) as { url?: string }
    rawUrl = (data.url || '').trim()
  } catch {
    rawUrl = (msg.content || '').trim()
  }

  const voiceUrl = await resolveVoicePlaySrc(rawUrl)
  if (!voiceUrl || voiceUrl === '[语音]') {
    uni.showToast({ title: '暂无可用音频', icon: 'none' })
    return
  }

  stopVoicePlayback()

  playingVoiceId.value = msg.id
  const ctx = uni.createInnerAudioContext()
  voicePlayer = ctx
  ctx.obeyMuteSwitch = false
  ctx.src = voiceUrl
  ctx.play()

  ctx.onEnded(() => {
    stopVoicePlayback()
  })

  ctx.onError((err) => {
    console.warn('[InnerAudio]', err, voiceUrl)
    stopVoicePlayback()
    uni.showToast({ title: '播放失败', icon: 'none' })
  })
}

// 格式化语音时长
function formatDuration(duration?: number): string {
  if (!duration) return '0'
  return Math.ceil(duration / 1000).toString()
}
</script>

<style scoped lang="scss">
@import '@/styles/vars.scss';
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// 图片消息样式
.image-bubble {
  padding: 8rpx !important;
  max-width: 400rpx;

  .msg-image {
    max-width: 380rpx;
    max-height: 400rpx;
    border-radius: 16rpx;
    display: block;
  }
}

// 语音消息样式
.voice-bubble {
  min-width: 200rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;

  .voice-content {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .voice-icon {
      font-size: 32rpx;
    }

    .voice-duration {
      font-size: 26rpx;
      color: $text-secondary;
    }
  }

  .voice-wave-preview {
    display: flex;
    align-items: center;
    gap: 6rpx;

    .voice-bar {
      width: 6rpx;
      background: #c084fc;
      border-radius: 3rpx;
    }
  }
}

// Emoji 消息样式
.emoji-bubble {
  background: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;

  .emoji-content {
    font-size: 80rpx;
    line-height: 1;
  }
}

// 消息状态
.msg-status {
  position: absolute;
  bottom: -24rpx;
  right: 0;

  text {
    font-size: 18rpx;
    color: $text-tertiary;
  }
}
</style>
