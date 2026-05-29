<template>
  <view class="moment-comment-sheet">
    <!-- 拖拽把手 + 标题 -->
    <text class="comment-sheet-title">
      评论 {{ currentPost ? '· ' + currentPost.commentCount : '' }}
    </text>

    <!-- 评论列表 -->
    <scroll-view
      scroll-y
      class="comment-list"
      @scrolltolower="onLoadMore"
      style="flex:1;"
    >
      <view v-if="state?.loading && !state?.list?.length" class="comment-skeleton">
        <view v-for="i in 3" :key="i" class="skeleton-row" style="height:80rpx;margin-bottom:24rpx;border-radius:16rpx;" />
      </view>

      <view v-else-if="!state?.list?.length" class="comment-empty">
        <text>还没有评论，快来抢沙发 💬</text>
      </view>

      <view
        v-for="comment in state?.list || []"
        :key="comment.id"
        class="comment-item"
      >
        <image
          class="comment-avatar"
          :src="resolveAvatar(comment.author.avatar)"
          mode="aspectFill"
        />
        <view class="comment-body">
          <text class="comment-author">{{ comment.author.nickname }}</text>
          <text class="comment-text">{{ comment.content }}</text>
          <text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
        </view>
      </view>

      <view v-if="state?.loading && state?.list?.length" class="load-tip">
        <text>加载中…</text>
      </view>
    </scroll-view>

    <!-- 输入栏 -->
    <view class="comment-input-row">
      <input
        class="comment-input"
        v-model="circleStore.commentInput"
        placeholder="说点什么…"
        :maxlength="200"
        confirm-type="send"
        @confirm="onSend"
      />
      <view
        class="comment-send-btn"
        :class="{ disabled: !circleStore.commentInput.trim() }"
        @click="onSend"
      >
        <text>➤</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCircleStore } from '@/stores/circle'
import { resolveAvatar } from '@/utils/avatar'

const circleStore = useCircleStore()

const postId = computed(() => circleStore.commentSheetPostId)
const currentPost = computed(() => {
  if (!postId.value) return null
  return circleStore.posts.find((p) => p.id === postId.value) || null
})
const state = computed(() => (postId.value ? circleStore.commentState[postId.value] : null))

async function onLoadMore() {
  if (postId.value) {
    await circleStore.loadComments(postId.value)
  }
}

async function onSend() {
  if (!postId.value) return
  await circleStore.submitComment(postId.value)
}

function formatTime(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped lang="scss">
.comment-skeleton {
  padding: 0 32rpx;
}

.skeleton-row {
  background: rgba(255, 255, 255, 0.07);
  animation: sk-pulse 1.5s ease-in-out infinite;
}

@keyframes sk-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.comment-empty {
  padding: 80rpx 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 26rpx;
}

.load-tip {
  text-align: center;
  padding: 16rpx 0;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.3);
}
</style>
