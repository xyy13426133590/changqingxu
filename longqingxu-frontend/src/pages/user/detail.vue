<template>
  <view class="page-container gradient-bg">
    <view class="nav glass" @click="goBack">
      <text class="nav-back">‹ 返回</text>
      <text class="nav-title">用户详情</text>
      <view class="nav-right" />
    </view>
    <view class="placeholder glass">
      <text v-if="userId" class="hint">用户 ID：{{ userId }}</text>
      <text class="hint">详情页开发中</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const userId = ref('')
onLoad((query) => {
  userId.value = (query?.id as string) || ''
})

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/discover/index' }) })
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
.nav-back {
  font-size: 30rpx;
  min-width: 140rpx;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.hint {
  font-size: 28rpx;
  opacity: 0.55;
}
</style>
