<template>
  <view class="page-container gradient-bg welcome-page">
    <view :style="capsuleNavOuterStyle">
      <view class="top-bar" :style="capsuleNavRowStyle">
        <view class="back-circle" hover-class="btn-press" @tap.stop="goBack">
          <text class="back-ico">‹</text>
        </view>
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
import { computed } from 'vue'
import AuthSafetyTips from '@/components/AuthSafetyTips.vue'
import { navigateBackTo } from '@/utils/navigation'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())

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
@import '@/styles/vars.scss';
.welcome-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.back-circle {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 200, 220, 0.1);
  border: 1rpx solid rgba(255, 200, 220, 0.2);
  backdrop-filter: blur(12px);
}

.back-ico {
  font-size: 40rpx;
  color: $text-secondary;
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
  color: #e879f9;
  display: block;
  line-height: 1.15;
}

.brand-tag {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: $text-secondary;
}

.brand-en {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $text-tertiary;
  letter-spacing: 0.12em;
}

.cta-primary {
  margin-top: 8rpx;
  padding: 28rpx 0;
  border-radius: 32rpx;
  text-align: center;
  background: linear-gradient(135deg, #c084fc, #f472b6);
  box-shadow: 0 8rpx 28rpx rgba(244, 114, 182, 0.38);

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
    color: #f9a8d4;
    font-weight: 500;
  }
}

.agree-line {
  margin-top: 28rpx;
  padding: 0 8rpx;
  text-align: center;

  text {
    font-size: 22rpx;
    color: $text-tertiary;
    line-height: 1.5;
  }
}
</style>
