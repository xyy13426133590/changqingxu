<template>
  <view class="gradient-bg my-moments-page">
    <!-- 状态栏 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 顶栏 -->
    <view class="my-moments-nav">
      <view class="nav-back" @click="goBack">
        <text>‹</text>
      </view>
      <text class="nav-title">我的动态</text>
      <view style="width: 80rpx;" />
    </view>

    <!-- 个人身份条 -->
    <view class="my-moments-identity" @click="goEditProfile">
      <image
        class="identity-avatar"
        :src="resolveAvatar(userStore.profile?.avatar)"
        mode="aspectFill"
      />
      <view class="identity-info">
        <text class="identity-name">{{ userStore.profile?.nickname || '我的账号' }}</text>
        <text class="identity-hint">点击编辑资料 ›</text>
      </view>
    </view>

    <!-- 统计条 -->
    <view class="my-moments-stats">
      <view v-if="store.statsLoaded" class="stats-row">
        <text class="stats-text">
          <text class="stats-num">{{ store.stats.postCount }}</text> 条动态
        </text>
        <text class="stats-sep">·</text>
        <text class="stats-text">
          <text class="stats-num">{{ store.stats.totalLikes }}</text> 获赞
        </text>
        <text class="stats-sep">·</text>
        <text class="stats-text">
          <text class="stats-num">{{ store.stats.totalComments }}</text> 评论
        </text>
      </view>
      <view v-else class="stats-row stats-placeholder">
        <text>加载中…</text>
      </view>
    </view>

    <!-- 子 Tab -->
    <view class="my-moments-tabs">
      <view class="tab-item active">
        <text>作品</text>
        <view class="tab-line" />
      </view>
      <view class="tab-item disabled">
        <text>喜欢</text>
        <text class="tab-coming">即将上线</text>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view
      scroll-y
      class="my-moments-scroll"
      :style="{ height: scrollHeight + 'px' }"
      @scrolltolower="onLoadMore"
      refresher-enabled
      :refresher-triggered="store.refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 骨架屏 -->
      <view v-if="store.refreshing && store.posts.length === 0" class="skeleton-wrap">
        <view v-for="i in 3" :key="i" class="moment-card skeleton-card">
          <view class="skeleton-row" style="width:70%; height:28rpx; margin-bottom:16rpx;" />
          <view class="skeleton-row" style="width:40%; height:22rpx; margin-bottom:24rpx;" />
          <view class="skeleton-row" style="width:100%; height:200rpx;" />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!store.refreshing && store.posts.length === 0" class="my-moments-empty">
        <text class="empty-icon">✦</text>
        <text class="empty-title">还没有发布动态</text>
        <text class="empty-desc">分享生活，更容易被看见</text>
        <view class="empty-publish-btn" @click="goPublish">
          <text>去发布</text>
        </view>
      </view>

      <!-- 动态列表 -->
      <view v-else class="my-moments-list">
        <view
          v-for="post in store.posts"
          :key="post.id"
          class="moment-card my-moment-card"
        >
          <!-- 卡片顶行：时间 + 可见性 + 更多 -->
          <view class="my-card-header">
            <view class="my-card-meta">
              <text class="my-card-time">{{ formatTime(post.createdAt) }}</text>
              <view v-if="post.location?.name" class="moment-location">
                <text>📍</text>
                <text>{{ post.location.name }}</text>
              </view>
            </view>
            <view class="my-card-right">
              <view
                class="moment-visibility-badge"
                :class="post.visibility === 'public' ? 'public' : 'login-only'"
              >
                {{ post.visibility === 'public' ? '公开' : '登录可见' }}
              </view>
              <view class="my-card-more" @click.stop="onMore(post)">
                <text>⋯</text>
              </view>
            </view>
          </view>

          <!-- 内容文字 -->
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

          <!-- 操作数据行 -->
          <view class="moment-actions">
            <view class="moment-action-stat">
              <text class="action-icon">🤍</text>
              <text>{{ post.likeCount }}</text>
            </view>
            <view class="moment-action-stat">
              <text class="action-icon">💬</text>
              <text>{{ post.commentCount }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="store.loading" class="load-more-tip">
          <text>加载中…</text>
        </view>
        <view v-else-if="!store.hasMore && store.posts.length > 0" class="load-more-tip">
          <text>— 已经到底啦 —</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底栏：发布动态 -->
    <view class="my-moments-publish-bar">
      <view class="publish-bar-btn" @click="goPublish">
        <text class="publish-bar-icon">＋</text>
        <text class="publish-bar-label">发布动态</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMyMomentsStore } from '@/stores/my-moments'
import { useUserStore } from '@/stores/user'
import { resolveAvatar } from '@/utils/avatar'
import type { MomentPost, MomentMedia } from '@/services/api-moment'

const store = useMyMomentsStore()
const userStore = useUserStore()

const statusBarHeight = ref(0)
const scrollHeight = ref(500)

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  // 顶栏 ~88rpx + 身份条 ~120rpx + 统计条 ~72rpx + Tab ~76rpx + 底栏 ~100rpx
  const fixedH =
    uni.upx2px(88) +
    uni.upx2px(120) +
    uni.upx2px(72) +
    uni.upx2px(76) +
    uni.upx2px(100) +
    statusBarHeight.value
  scrollHeight.value = sysInfo.windowHeight - fixedH
})

onShow(async () => {
  if (store.posts.length === 0) {
    await store.refresh()
  }
})

function goBack() {
  uni.navigateBack()
}

function goEditProfile() {
  uni.navigateTo({ url: '/pages/mine/profile-edit' })
}

function goPublish() {
  uni.navigateTo({ url: '/pages/circle/publish' })
}

async function onRefresh() {
  await store.refresh()
}

async function onLoadMore() {
  await store.loadMore()
}

function onMore(post: MomentPost) {
  uni.showActionSheet({
    itemList: ['删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        onDelete(post)
      }
    },
  })
}

function onDelete(post: MomentPost) {
  uni.showModal({
    title: '删除动态',
    content: '确定删除这条动态吗？删除后不可恢复。',
    confirmText: '删除',
    confirmColor: '#ef4444',
    success: async (res) => {
      if (res.confirm) {
        await store.deletePost(post.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    },
  })
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
  uni.showToast({ title: '视频播放中', icon: 'none' })
}

function formatTime(isoStr: string): string {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return '刚刚'
    if (diffMin < 60) return `${diffMin}分钟前`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}小时前`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}天前`
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const nowYear = now.getFullYear()
    return nowYear === y ? `${m}-${day}` : `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
@import '@/styles/vars.scss';

.my-moments-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
}

/* 顶栏 */
.my-moments-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
}

.nav-back {
  width: 80rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  text {
    font-size: 52rpx;
    color: $text-primary;
    line-height: 1;
  }
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 1rpx;
}

/* 身份条 */
.my-moments-identity {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background: rgba(255, 255, 255, 0.05);
  margin: 0 24rpx 0;
  border-radius: 20rpx;
  border: 1rpx solid $border-subtle;
}

.identity-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid $border-color;
  flex-shrink: 0;
}

.identity-info {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.identity-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.identity-hint {
  font-size: 24rpx;
  color: $text-tertiary;
  margin-top: 4rpx;
}

/* 统计条 */
.my-moments-stats {
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.stats-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.stats-num {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.stats-sep {
  font-size: 26rpx;
  color: $text-disabled;
}

.stats-placeholder text {
  font-size: 26rpx;
  color: $text-tertiary;
}

/* 子 Tab */
.my-moments-tabs {
  display: flex;
  border-bottom: 1rpx solid $border-subtle;
  margin: 0 24rpx;
}

.tab-item {
  padding: 16rpx 32rpx;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10rpx;

  text {
    font-size: 28rpx;
    color: $text-secondary;
    font-weight: 500;
  }

  &.active text:first-child {
    color: $primary-light;
    font-weight: 700;
  }

  &.disabled text:first-child {
    color: $text-disabled;
  }
}

.tab-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  border-radius: 2rpx;
  background: $primary-light;
}

.tab-coming {
  font-size: 20rpx !important;
  color: $text-disabled !important;
  background: rgba(255, 255, 255, 0.08);
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-weight: 400 !important;
}

/* 滚动区 */
.my-moments-scroll {
  flex: 1;
}

.skeleton-wrap {
  padding: 24rpx;
}

/* 空状态 */
.my-moments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx 48rpx;
}

.empty-icon {
  font-size: 64rpx;
  color: $primary-light;
  margin-bottom: 24rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: $text-tertiary;
  margin-bottom: 48rpx;
  text-align: center;
}

.empty-publish-btn {
  padding: 22rpx 64rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, $primary, #f472b6);
  box-shadow: 0 8rpx 24rpx rgba(192, 132, 252, 0.4);

  text {
    font-size: 30rpx;
    font-weight: 600;
    color: #fff;
  }
}

/* 动态列表 */
.my-moments-list {
  padding: 16rpx 24rpx;
}

.my-moment-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  background: $surface-card;
  border-radius: 20rpx;
  border: 1rpx solid $border-subtle;
}

.my-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.my-card-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.my-card-time {
  font-size: 24rpx;
  color: $text-tertiary;
}

.moment-location {
  display: flex;
  align-items: center;
  gap: 4rpx;

  text {
    font-size: 22rpx;
    color: $text-tertiary;
  }
}

.my-card-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.my-card-more {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 32rpx;
    color: $text-tertiary;
    letter-spacing: 2rpx;
  }
}

.moment-content {
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.6;
  margin-bottom: 16rpx;
  display: block;
  word-break: break-all;
}

/* 图片九宫格 */
.moment-media-grid {
  display: grid;
  gap: 6rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.moment-media-grid.grid-1 {
  grid-template-columns: 1fr;
}
.moment-media-grid.grid-2 {
  grid-template-columns: 1fr 1fr;
}
.moment-media-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}
.moment-media-grid.grid-4 {
  grid-template-columns: repeat(2, 1fr);
}
.moment-media-grid.grid-5,
.moment-media-grid.grid-6 {
  grid-template-columns: repeat(3, 1fr);
}
.moment-media-grid.grid-7,
.moment-media-grid.grid-8,
.moment-media-grid.grid-9 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-item {
  aspect-ratio: 1;
  overflow: hidden;
  background: $surface-input;

  image {
    width: 100%;
    height: 100%;
  }
}

/* 视频封面 */
.moment-video-cell {
  height: 360rpx;
  background: $surface-input;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 16rpx;
}

.video-play-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  text { font-size: 40rpx; color: #fff; }
}

.video-duration {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.4);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

/* 操作行（仅展示数据，不可点击） */
.moment-actions {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-subtle;
}

.moment-action-stat {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 26rpx;
    color: $text-tertiary;
  }

  .action-icon {
    font-size: 28rpx;
  }
}

/* 可见性角标 */
.moment-visibility-badge {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 500;

  &.public {
    background: $badge-done-bg;
    color: $badge-done-text;
    border: 1rpx solid $badge-done-border;
  }

  &.login-only {
    background: $badge-pending-bg;
    color: $badge-pending-text;
    border: 1rpx solid $badge-pending-border;
  }
}

/* 骨架 */
.skeleton-card {
  background: $surface-card !important;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  padding: 24rpx;
  border: 1rpx solid $border-subtle;
}

.skeleton-row {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8rpx;
  display: block;
}

.load-more-tip {
  text-align: center;
  padding: 24rpx;
  text {
    font-size: 24rpx;
    color: $text-disabled;
  }
}

/* 底栏发布 */
.my-moments-publish-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  background: $surface-tabbar;
  border-top: 1rpx solid $border-color;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.publish-bar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 22rpx 0;
  border-radius: 40rpx;
  background: linear-gradient(135deg, $primary, #f472b6);
  box-shadow: 0 6rpx 24rpx rgba(192, 132, 252, 0.35);
}

.publish-bar-icon {
  font-size: 36rpx;
  font-weight: 300;
  color: #fff;
  line-height: 1;
}

.publish-bar-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}
</style>
