<template>
  <view class="gradient-bg page-container" style="padding-bottom: 0;">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶栏 -->
    <view class="circle-header">
      <text class="circle-title">✦ 圈子</text>
      <view class="circle-notify-btn">
        <text>🔔</text>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="circle-tab-pills">
      <view
        v-for="tab in circleTabs"
        :key="tab.id"
        class="circle-pill"
        :class="activeCircleTab === tab.id ? 'active' : 'inactive'"
        @click="activeCircleTab = tab.id"
      >
        {{ tab.name }}
      </view>
    </view>

    <!-- Feed 列表 -->
    <scroll-view
      scroll-y
      class="feed-scroll"
      :style="{ height: scrollHeight + 'px' }"
      @scrolltolower="onLoadMore"
      refresher-enabled
      :refresher-triggered="circleStore.refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="circle-feed-list">
        <!-- 骨架屏 -->
        <view v-if="circleStore.loading && circleStore.posts.length === 0">
          <view v-for="i in 3" :key="i" class="moment-card skeleton-card">
            <view class="skeleton-row" style="width:70%; height:28rpx; margin-bottom:16rpx;" />
            <view class="skeleton-row" style="width:40%; height:22rpx; margin-bottom:24rpx;" />
            <view class="skeleton-row" style="width:100%; height:200rpx;" />
          </view>
        </view>

        <!-- 动态列表 -->
        <template v-else>
          <view
            v-for="post in circleStore.posts"
            :key="post.id"
            @click="onCardClick(post)"
          >
            <!-- 敏感内容蒙层 -->
            <view v-if="post.masked" class="moment-masked-card">
              <view class="moment-author-row">
                <image
                  class="moment-avatar"
                  :src="resolveAvatar(post.author.avatar)"
                  mode="aspectFill"
                />
                <view class="moment-author-info">
                  <text class="moment-author-name">{{ post.author.nickname }}</text>
                  <view class="moment-author-meta">
                    <text>{{ formatTime(post.createdAt) }}</text>
                  </view>
                </view>
                <view class="moment-visibility-badge login-only">仅登录可见</view>
              </view>
              <view class="masked-body">
                <text class="masked-icon">🔒</text>
                <text class="masked-text">该内容仅登录用户可见{{ '\n' }}登录后查看完整动态</text>
                <view class="masked-login-btn" @click.stop="showLoginModal">立即登录</view>
              </view>
            </view>

            <!-- 正常卡片 -->
            <view v-else class="moment-card">
              <view class="moment-author-row">
                <image
                  class="moment-avatar"
                  :src="resolveAvatar(post.author.avatar)"
                  mode="aspectFill"
                />
                <view class="moment-author-info">
                  <text class="moment-author-name">{{ post.author.nickname }}</text>
                  <view class="moment-author-meta">
                    <text>{{ formatTime(post.createdAt) }}</text>
                    <view v-if="post.location?.name" class="moment-location">
                      <text>📍</text>
                      <text>{{ post.location.name }}</text>
                    </view>
                  </view>
                </view>
                <view
                  class="moment-visibility-badge"
                  :class="post.visibility === 'public' ? 'public' : 'login-only'"
                >
                  {{ post.visibility === 'public' ? '公开' : '登录可见' }}
                </view>
              </view>

              <text v-if="post.content" class="moment-content">{{ post.content }}</text>

              <!-- 图片九宫格 -->
              <view
                v-if="hasImages(post)"
                class="moment-media-grid"
                :class="`grid-${imageCount(post)}`"
              >
                <view
                  v-for="(media, idx) in imageMedia(post)"
                  :key="idx"
                  class="grid-item"
                  @click.stop="previewImage(post, idx)"
                >
                  <image :src="media.fileID" mode="aspectFill" lazy-load />
                </view>
              </view>

              <!-- 视频 -->
              <view v-else-if="hasVideo(post)" class="moment-video-cell" @click.stop="playVideo(post)">
                <view class="video-play-btn"><text>▶</text></view>
                <text v-if="videoMedia(post)?.duration" class="video-duration">
                  {{ formatDuration(videoMedia(post)!.duration!) }}
                </text>
              </view>

              <!-- 操作栏 -->
              <view class="moment-actions">
                <view
                  class="moment-action-btn"
                  :class="{ liked: post.isLiked }"
                  @click.stop="onLike(post)"
                >
                  <text class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</text>
                  <text>{{ post.likeCount }}</text>
                </view>
                <view class="moment-action-btn" @click.stop="onComment(post)">
                  <text class="action-icon">💬</text>
                  <text>{{ post.commentCount }}</text>
                </view>
                <view style="flex:1" />
                <view v-if="isMyPost(post)" class="moment-action-btn" @click.stop="onDelete(post)">
                  <text class="action-icon">🗑️</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="!circleStore.loading && circleStore.posts.length === 0" class="empty-state">
            <text>暂无动态，来发布第一条吧 ✦</text>
          </view>

          <!-- 加载更多 -->
          <view v-if="circleStore.loading && circleStore.posts.length > 0" class="load-more-tip">
            <text>加载中…</text>
          </view>
          <view v-else-if="!circleStore.hasMore && circleStore.posts.length > 0" class="load-more-tip">
            <text>— 已经到底啦 —</text>
          </view>
        </template>
      </view>
    </scroll-view>

    <!-- 发布 FAB -->
    <view class="circle-publish-fab" @click="goPublish">
      <text>✦</text>
    </view>

    <!-- TabBar -->
    <TabBar active="circle" />

    <!-- 评论抽屉 -->
    <MomentCommentSheet v-if="circleStore.commentSheetPostId" />

    <!-- 遮罩 -->
    <view
      v-if="circleStore.commentSheetPostId"
      class="sheet-overlay"
      @click="circleStore.closeCommentSheet()"
    />

    <!-- 登录弹窗 -->
    <view v-if="showLogin" class="circle-login-modal">
      <view class="login-modal-box">
        <text class="modal-icon">💕</text>
        <text class="modal-title">登录后解锁全部互动</text>
        <text class="modal-desc">登录即可点赞、评论、发布动态{{ '\n' }}和心仪的 TA 产生连接</text>
        <view class="modal-btn-group">
          <view class="modal-btn-primary" @click="goLogin">立即登录</view>
          <view class="modal-btn-ghost" @click="showLogin = false">稍后再说</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TabBar from '@/components/TabBar.vue'
import MomentCommentSheet from '@/components/MomentCommentSheet.vue'
import { useCircleStore } from '@/stores/circle'
import { useUserStore } from '@/stores/user'
import { resolveAvatar } from '@/utils/avatar'
import type { MomentPost, MomentMedia } from '@/services/api-moment'

const circleStore = useCircleStore()
const userStore = useUserStore()

const showLogin = ref(false)

const circleTabs = [
  { id: 'default_public', name: '全站广场' },
  { id: 'follow', name: '关注' },
  { id: 'nearby', name: '同城' },
]
const activeCircleTab = ref('default_public')

const statusBarHeight = ref(0)
const scrollHeight = ref(500)

onMounted(async () => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  // 100rpx顶栏 + 70rpx分类 + statusBar + 底部tabbar(约82px)
  const navBarH = uni.upx2px(100) + uni.upx2px(70)
  scrollHeight.value = sysInfo.windowHeight - statusBarHeight.value - navBarH - uni.upx2px(160)

  if (circleStore.posts.length === 0) {
    await circleStore.refreshFeed()
  }
})

onShow(() => {
  // 每次进入页面检查是否需要刷新（发布后）
})

async function onRefresh() {
  await circleStore.refreshFeed()
}

async function onLoadMore() {
  await circleStore.loadMore()
}

function goPublish() {
  if (!userStore.isLoggedIn) {
    showLoginModal()
    return
  }
  uni.navigateTo({ url: '/pages/circle/publish' })
}

function showLoginModal() {
  showLogin.value = true
}

function goLogin() {
  showLogin.value = false
  uni.navigateTo({ url: '/pages/auth/login' })
}

function onCardClick(_post: MomentPost) {
  // 后续可跳转详情页
}

function onLike(post: MomentPost) {
  if (!userStore.isLoggedIn) {
    showLoginModal()
    return
  }
  circleStore.toggleLike(post.id)
}

function onComment(post: MomentPost) {
  if (!userStore.isLoggedIn) {
    showLoginModal()
    return
  }
  circleStore.openCommentSheet(post.id)
}

async function onDelete(post: MomentPost) {
  uni.showModal({
    title: '删除动态',
    content: '确定删除这条动态吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const { apiDeletePost } = await import('@/services/api-moment')
          await apiDeletePost(post.id)
          circleStore.removePost(post.id)
          uni.showToast({ title: '已删除', icon: 'success' })
        } catch {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

function isMyPost(post: MomentPost) {
  return userStore.user?.id && post.author.id === userStore.user.id
}

// 媒体工具
function hasImages(post: MomentPost) {
  return post.media?.some((m) => m.type === 'image')
}
function imageMedia(post: MomentPost): MomentMedia[] {
  return post.media?.filter((m) => m.type === 'image') || []
}
function imageCount(post: MomentPost) {
  return imageMedia(post).length
}
function hasVideo(post: MomentPost) {
  return post.media?.some((m) => m.type === 'video')
}
function videoMedia(post: MomentPost): MomentMedia | undefined {
  return post.media?.find((m) => m.type === 'video')
}

function previewImage(post: MomentPost, idx: number) {
  const urls = imageMedia(post).map((m) => m.fileID)
  uni.previewImage({ urls, current: urls[idx] })
}

function playVideo(post: MomentPost) {
  const video = videoMedia(post)
  if (!video) return
  // 使用临时 URL 或直接用 fileID（微信环境支持）
  // 可用 wx.cloud.getTempFileURL 获取临时链接
  uni.showToast({ title: '视频播放中', icon: 'none' })
}

// 时间格式化
function formatTime(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 86400000 * 3) return Math.floor(diff / 86400000) + '天前'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
.feed-scroll {
  flex: 1;
}

.skeleton-card {
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-row {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8rpx;
}

@keyframes skeleton-shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.load-more-tip {
  text-align: center;
  padding: 32rpx 0;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.3);
}

.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 199;
}
</style>
