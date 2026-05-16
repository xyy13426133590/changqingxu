<template>
  <view class="page-container gradient-bg welcome-page">
    <view class="top-bar">
      <view class="back-circle" hover-class="btn-press" @tap.stop="goBack">
        <text class="back-ico">‹</text>
      </view>
    </view>

    <scroll-view class="welcome-scroll" scroll-y show-scrollbar="false">
      <view class="brand-block">
        <text class="brand-logo font-logo">长情许</text>
        <text class="brand-tag">真实身份 · 真诚交友</text>
        <text class="brand-en">CHANG QING XU</text>
      </view>

      <AuthSafetyTips />

      <view class="cta-primary" @click="goLogin">
        <text>我已了解，去登录</text>
      </view>

      <view class="cta-secondary" @click="goRegister">
        <text>还没有账号？注册</text>
      </view>

      <view class="agree-line">
        <text>进入登录即表示已阅读《用户协议》和《隐私政策》（演示文案）</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import AuthSafetyTips from '@/components/AuthSafetyTips.vue'
import { navigateBackTo } from '@/utils/navigation'

function goBack() {
  navigateBackTo('/pages/mine/index')
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
}
</script>

<style scoped lang="scss">
.welcome-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  padding: 24rpx 32rpx 0;
}

.back-circle {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
}

.back-ico {
  font-size: 40rpx;
  color: #4b5563;
  font-weight: 300;
}

.welcome-scroll {
  flex: 1;
  min-height: 0;
  padding: 16rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));
}

.brand-block {
  text-align: center;
  padding: 32rpx 0 24rpx;
}

.brand-logo {
  font-size: 68rpx;
  color: #5b21b6;
  display: block;
  line-height: 1.15;
}

.brand-tag {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.brand-en {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9ca3af;
  letter-spacing: 0.12em;
}

.cta-primary {
  margin-top: 8rpx;
  padding: 28rpx 0;
  border-radius: 32rpx;
  text-align: center;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  box-shadow: 0 8rpx 28rpx rgba(139, 92, 246, 0.35);

  text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }
}

.cta-secondary {
  margin-top: 24rpx;
  padding: 20rpx 0;
  text-align: center;

  text {
    font-size: 28rpx;
    color: #7c3aed;
    font-weight: 500;
  }
}

.agree-line {
  margin-top: 28rpx;
  padding: 0 8rpx;
  text-align: center;

  text {
    font-size: 22rpx;
    color: #6b7280;
    line-height: 1.5;
  }
}
</style>
