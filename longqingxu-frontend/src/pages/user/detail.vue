<template>
  <view class="page-container gradient-bg">
    <view class="nav glass user-detail-nav">
      <view class="nav-back-wrap" hover-class="btn-press" @tap.stop="goBack">
        <text class="nav-back">‹ 返回</text>
      </view>
      <text class="nav-title">用户详情</text>
      <view class="nav-right" />
    </view>
    <view v-if="loading" class="placeholder glass">
      <text class="hint">加载中…</text>
    </view>
    <scroll-view v-else-if="card" class="detail-scroll" scroll-y show-scrollbar="false">
      <view class="detail-card glass">
        <image class="detail-photo" :src="card.avatar" mode="aspectFill" />
        <text class="detail-name">{{ card.nickname }}</text>
        <text class="detail-meta">{{ card.age }}岁 · {{ card.location }} · {{ card.height ?? '—' }}cm</text>
        <text class="detail-line">{{ card.matchReason }} · {{ card.matchTagline }}</text>
        <text class="detail-bio">{{ card.bio }}</text>
      </view>
    </scroll-view>
    <view v-else class="placeholder glass">
      <text class="hint">{{ errorHint || '未找到用户' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { apiGetUserDetail, type UserCard } from '@/services/api-user'
import { resolveAvatar } from '@/utils/avatar'
import { navigateBackTo } from '@/utils/navigation'

const userId = ref('')
const loading = ref(true)
const card = ref<UserCard | null>(null)
const errorHint = ref('')

onLoad((query) => {
  userId.value = (query?.id as string) || ''
  void loadDetail()
})

async function loadDetail() {
  loading.value = true
  card.value = null
  errorHint.value = ''
  const id = userId.value.trim()
  if (!id) {
    loading.value = false
    return
  }
  try {
    const c = await apiGetUserDetail(id)
    card.value = {
      ...c,
      avatar: resolveAvatar(c.avatar, c.id),
    }
  } catch {
    errorHint.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function goBack() {
  navigateBackTo('/pages/discover/index')
}
</script>

<style scoped lang="scss">
.nav {
  margin: 24rpx 32rpx 0;
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-back-wrap {
  min-width: 140rpx;
}

.nav-back {
  font-size: 30rpx;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
}
.nav-right {
  min-width: 140rpx;
}
.placeholder {
  margin: 32rpx;
  padding: 48rpx;
  border-radius: 24rpx;
}
.hint {
  font-size: 28rpx;
  opacity: 0.65;
}
.detail-scroll {
  flex: 1;
  padding: 24rpx 32rpx 48rpx;
}
.detail-card {
  padding: 32rpx;
  border-radius: 24rpx;
}
.detail-photo {
  width: 100%;
  height: 420rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}
.detail-name {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
}
.detail-meta {
  font-size: 26rpx;
  color: #6b7280;
  margin-top: 12rpx;
  display: block;
}
.detail-line {
  font-size: 26rpx;
  margin-top: 16rpx;
  display: block;
}
.detail-bio {
  font-size: 28rpx;
  margin-top: 24rpx;
  line-height: 1.5;
}
</style>
