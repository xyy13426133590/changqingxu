<template>
  <view class="page gradient-bg legal-page">
    <view class="nav-row">
      <view class="back" hover-class="btn-press" @tap="goBack"><text>‹</text></view>
      <text class="nav-title">会员服务协议</text>
      <view class="nav-placeholder" />
    </view>
    <scroll-view class="scroll" scroll-y>
      <view class="content">
        <text class="p">
          本协议为会员服务说明占位页，上线前请替换为经法务审核的正式《会员服务协议》全文。
        </text>
        <text class="p">
          开通会员即表示您已阅读并同意相关服务条款，服务内容及价格以会员中心展示为准。
        </text>
        <text class="p">支付通过微信支付完成，退款规则以支付渠道及平台公示为准。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { navigateBackTo } from '@/utils/navigation'

function goBack() {
  navigateBackTo('/pages/mine/vip-center')
}
</script>

<style scoped lang="scss">
.legal-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
}

.back {
  width: 64rpx;
  font-size: 44rpx;
  color: #374151;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #111827;
}

.nav-placeholder {
  width: 64rpx;
}

.scroll {
  flex: 1;
  height: 0;
}

.content {
  padding: 32rpx 40rpx 80rpx;
}

.p {
  display: block;
  font-size: 28rpx;
  line-height: 1.75;
  color: #4b5563;
  margin-bottom: 28rpx;
}
</style>
