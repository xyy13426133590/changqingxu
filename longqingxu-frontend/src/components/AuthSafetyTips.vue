<template>
  <view class="safety-card glass">
    <view class="safety-head">
      <view class="safety-icon">🛡️</view>
      <view class="safety-head-text">
        <text class="safety-title">安全交友提醒</text>
        <text class="safety-sub">请仔细阅读以下提示</text>
      </view>
    </view>

    <view class="safety-block danger">
      <text class="danger-text">本小程序仅限 18 周岁以上成年人使用，未成年人禁止注册、禁止使用。</text>
    </view>

    <view class="safety-list">
      <view v-for="(line, i) in bullets" :key="i" class="safety-li">
        <text class="li-dot">✓</text>
        <text class="li-txt">{{ line }}</text>
      </view>
    </view>

    <view class="safety-block info">
      <text class="info-text">
        本平台属相、生肖三合六合匹配仅为传统民俗文化参考，仅供娱乐交友使用，不作为婚恋或人生决策唯一依据。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
const bullets = [
  '建议完成实名认证与人脸识别，提升信任与匹配质量',
  '请勿轻信涉及金钱、投资、借贷的请求',
  '首次见面请选择公共场所，并告知亲友行踪',
  '发现可疑行为请立即举报，平台将依规处理',
]
</script>

<style scoped lang="scss">
.safety-card {
  border-radius: 28rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(14px);
}

.safety-head {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.safety-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb923c, #ef4444);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.safety-head-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.safety-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.safety-sub {
  font-size: 22rpx;
  color: #6b7280;
}

.safety-block {
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;

  &.danger {
    background: rgba(254, 226, 226, 0.85);
    border: 1rpx solid rgba(252, 165, 165, 0.6);
  }

  &.info {
    background: rgba(237, 233, 254, 0.85);
    border: 1rpx solid rgba(196, 181, 253, 0.55);
    margin-bottom: 0;
  }
}

.danger-text {
  font-size: 26rpx;
  color: #b91c1c;
  line-height: 1.55;
}

.info-text {
  font-size: 22rpx;
  color: #5b21b6;
  line-height: 1.55;
}

.safety-list {
  margin-bottom: 16rpx;
}

.safety-li {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.li-dot {
  font-size: 22rpx;
  color: #7c3aed;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.li-txt {
  flex: 1;
  font-size: 26rpx;
  color: #4b5563;
  line-height: 1.45;
}
</style>
