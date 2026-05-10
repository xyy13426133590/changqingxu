<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航 -->
    <view class="chat-header">
      <view class="back-btn" @tap.stop="goBack">
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
        :class="{ me: msg.senderId === 'me', other: msg.senderId !== 'me' }"
      >
        <image
          v-if="msg.senderId !== 'me'"
          class="msg-avatar"
          :src="currentConversation?.avatar"
          mode="aspectFill"
        />

        <!-- 文字消息 -->
        <view
          v-if="msg.type === 'text'"
          class="message-bubble"
          :class="msg.senderId === 'me' ? 'me' : 'other'"
        >
          <text>{{ msg.content }}</text>
          <view v-if="msg.senderId === 'me'" class="msg-status">
            <text v-if="msg.status === 'sending'">◌</text>
            <text v-else-if="msg.status === 'sent'">✓</text>
            <text v-else>✓✓</text>
          </view>
        </view>

        <!-- 图片消息 -->
        <view
          v-else-if="msg.type === 'image'"
          class="message-bubble image-bubble"
          :class="msg.senderId === 'me' ? 'me' : 'other'"
          @click="previewImage(msg.content)"
        >
          <image class="msg-image" :src="msg.content" mode="widthFix" />
          <view v-if="msg.senderId === 'me'" class="msg-status">
            <text v-if="msg.status === 'sending'">◌</text>
            <text v-else-if="msg.status === 'sent'">✓</text>
            <text v-else>✓✓</text>
          </view>
        </view>

        <!-- 语音消息 -->
        <view
          v-else-if="msg.type === 'voice'"
          class="message-bubble voice-bubble"
          :class="msg.senderId === 'me' ? 'me' : 'other'"
          @click="playVoice(msg.content)"
        >
          <view class="voice-content">
            <text class="voice-icon">{{ playingVoiceId === msg.id ? '🔊' : '▶️' }}</text>
            <text class="voice-duration">{{ formatDuration(msg.duration) }}"</text>
          </view>
          <view class="voice-wave-preview">
            <view v-for="i in 5" :key="i" class="voice-bar" :style="{ height: `${Math.random() * 30 + 10}rpx` }"></view>
          </view>
          <view v-if="msg.senderId === 'me'" class="msg-status">
            <text v-if="msg.status === 'sending'">◌</text>
            <text v-else-if="msg.status === 'sent'">✓</text>
            <text v-else>✓✓</text>
          </view>
        </view>

        <!-- Emoji 表情消息 -->
        <view
          v-else-if="msg.type === 'emoji'"
          class="message-bubble emoji-bubble"
          :class="msg.senderId === 'me' ? 'me' : 'other'"
        >
          <text class="emoji-content">{{ msg.content }}</text>
          <view v-if="msg.senderId === 'me'" class="msg-status">
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
import { onLoad } from '@dcloudio/uni-app'
import { useMessagesStore } from '@/stores/messages'
import ChatInputBar from '@/components/ChatInputBar.vue'

const messagesStore = useMessagesStore()
const showRiskBanner = ref(true)
const conversationId = ref('')
const playingVoiceId = ref('')

// 当前会话
const currentConversation = computed(() => messagesStore.currentConversation)

// 当前消息列表
const currentMessages = computed(() => messagesStore.currentMessages)

// 最后一条消息ID（用于自动滚动）
const lastMessageId = computed(() => {
  const messages = currentMessages.value
  if (messages.length === 0) return ''
  return messages[messages.length - 1].id
})

// 页面加载
onLoad((options) => {
  if (options?.conversationId) {
    conversationId.value = options.conversationId
    messagesStore.setCurrentConversation(options.conversationId)
  }
})

// 返回：有栈则 navigateBack；仅一层栈时 navigateBack 的 delta 会变成 0 且不触发 fail，需主动回消息 Tab
function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
    return
  }
  uni.switchTab({ url: '/pages/messages/index' })
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
  messagesStore.sendMessage(voiceData, 'voice')
  // 设置语音消息的持续时间
  const messages = messagesStore.currentMessages
  const lastMsg = messages[messages.length - 1]
  if (lastMsg) {
    lastMsg.duration = duration
  }
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
function playVoice(content: string) {
  try {
    const data = JSON.parse(content)
    const voiceUrl = data.url || content

    // 设置当前播放的语音ID
    const messages = messagesStore.currentMessages
    const msg = messages.find(m => m.content === content && m.type === 'voice')
    if (msg) {
      playingVoiceId.value = msg.id
    }

    // 使用 uni 播放语音
    const innerAudioContext = uni.createInnerAudioContext()
    innerAudioContext.src = voiceUrl
    innerAudioContext.play()

    innerAudioContext.onEnded(() => {
      playingVoiceId.value = ''
      innerAudioContext.destroy()
    })

    innerAudioContext.onError(() => {
      playingVoiceId.value = ''
      uni.showToast({ title: '播放失败', icon: 'none' })
      innerAudioContext.destroy()
    })
  } catch (_e) {
    uni.showToast({ title: '语音解析失败', icon: 'none' })
  }
}

// 格式化语音时长
function formatDuration(duration?: number): string {
  if (!duration) return '0'
  return Math.ceil(duration / 1000).toString()
}
</script>

<style scoped lang="scss">
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
      color: #6b7280;
    }
  }

  .voice-wave-preview {
    display: flex;
    align-items: center;
    gap: 6rpx;

    .voice-bar {
      width: 6rpx;
      background: #8b5cf6;
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
    color: #9ca3af;
  }
}
</style>
