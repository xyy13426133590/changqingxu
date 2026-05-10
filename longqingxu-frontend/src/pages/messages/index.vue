<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航 -->
    <view class="messages-header">
      <view class="back-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="title">消息</text>
      <view class="placeholder" />
    </view>

    <!-- 会话列表 -->
    <scroll-view class="conversation-list" scroll-y show-scrollbar="false">
      <view v-if="sortedConversations.length === 0" class="empty-state">
        <text>暂无消息，去发现页看看吧～</text>
      </view>

      <view
        v-for="conv in sortedConversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ top: conv.isTop }"
        @click="enterChat(conv)"
      >
        <view class="avatar-wrap">
          <image class="avatar" :src="conv.avatar" mode="aspectFill" />
          <view v-if="conv.unreadCount > 0" class="unread-badge">
            {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
          </view>
        </view>
        <view class="content">
          <view class="top-row">
            <text class="nickname">{{ conv.nickname }}</text>
            <text class="time">{{ formatTime(conv.lastMessageTime) }}</text>
          </view>
          <text class="last-message">{{ conv.lastMessage || '暂无消息' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- TabBar -->
    <TabBar active="messages" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMessagesStore } from '@/stores/messages'
import TabBar from '@/components/TabBar.vue'
import { safeHideNativeTabBar } from '@/utils/tabbar'

onShow(() => {
  safeHideNativeTabBar()
})

const messagesStore = useMessagesStore()

// 排序后的会话列表（置顶的在前）
const sortedConversations = computed(() => {
  return [...messagesStore.conversations].sort((a, b) => {
    // 置顶的在最前面
    if (a.isTop && !b.isTop) return -1
    if (!a.isTop && b.isTop) return 1
    // 按最后消息时间倒序（兼容非 ISO 的旧数据）
    return messagesStore.lastMessageTimestamp(b.lastMessageTime) - messagesStore.lastMessageTimestamp(a.lastMessageTime)
  })
})

// 格式化时间
function formatTime(timeStr: string): string {
  return messagesStore.formatTime(timeStr)
}

// 返回发现页
function goBack() {
  uni.switchTab({ url: '/pages/discover/index' })
}

// 进入聊天页
function enterChat(conv: { id: string; userId: string; nickname: string; avatar: string }) {
  // 设置当前会话并清除未读
  messagesStore.setCurrentConversation(conv.id)
  // 跳转到聊天页
  uni.navigateTo({
    url: `/pages/messages/chat?conversationId=${conv.id}`,
  })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.placeholder {
  width: 72rpx;
}
</style>
