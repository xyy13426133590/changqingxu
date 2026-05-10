<template>
  <view class="page-container gradient-bg face-page">
    <view class="nav glass-row" @click="goBack">
      <text class="nav-back">‹</text>
      <text class="nav-title">人脸识别</text>
      <view class="nav-placeholder" />
    </view>

    <view class="face-body">
      <view v-if="onlyFace" class="banner">
        <text>未携带实名信息：完成后将仅更新「人脸认证」状态（演示）。</text>
      </view>
      <view v-else-if="!hasDraft" class="banner warn">
        <text>请先完成「实名认证」填写证件信息。</text>
        <view class="link" @click="goRealName"><text>去填写</text></view>
      </view>

      <view class="ring-wrap">
        <view class="ring-outer" />
        <view class="ring-inner">
          <text class="face-emoji">{{ stepEmoji }}</text>
        </view>
        <view class="corner tl" />
        <view class="corner tr" />
        <view class="corner bl" />
        <view class="corner br" />
      </view>

      <text class="face-title">{{ stepTitle }}</text>
      <text class="face-desc">{{ stepDesc }}</text>

      <view class="actions-row">
        <view v-for="(a, i) in actionHints" :key="i" class="action-chip">
          <text class="chip-ico">{{ a.icon }}</text>
          <text class="chip-t">{{ a.label }}</text>
        </view>
      </view>

      <view class="primary-btn" :class="{ disabled: running || !canStart }" @click="onStart">
        <text>{{ running ? '识别中…' : '开始识别' }}</text>
      </view>

      <text class="fine-print">演示环境不调用摄像头与活体 SDK；正式版需接入微信/支付宝等合规人脸核验能力。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const onlyFace = ref(false)
const running = ref(false)
const step = ref(0)

const hasDraft = computed(() => userStore.hasRealNameDraft())
const canStart = computed(() => onlyFace.value || hasDraft.value || userStore.profile.isRealName)

const actionHints = [
  { icon: '😮', label: '张嘴' },
  { icon: '↔️', label: '摇头' },
  { icon: '😉', label: '眨眼' },
]

const stepTitle = computed(() => {
  if (running.value) {
    if (step.value === 0) return '请张嘴'
    if (step.value === 1) return '请缓慢摇头'
    return '请眨眼'
  }
  return '请正对手机'
})

const stepDesc = computed(() => {
  if (running.value) return '保持面部在圆圈内，光线充足'
  return '按提示完成活体动作，保障账号安全'
})

const stepEmoji = computed(() => {
  if (!running.value) return '🧑'
  if (step.value === 0) return '😮'
  if (step.value === 1) return '🙂'
  return '😉'
})

onLoad((q) => {
  onlyFace.value = q?.onlyFace === '1' || q?.onlyFace === 'true'
})

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/mine/index' }) })
}

function goRealName() {
  uni.redirectTo({ url: '/pages/auth/real-name' })
}

function onStart() {
  if (running.value) return
  if (!onlyFace.value && !hasDraft.value && !userStore.profile.isRealName) {
    uni.showToast({ title: '请先完成实名信息', icon: 'none' })
    return
  }
  running.value = true
  step.value = 0
  const t1 = setTimeout(() => {
    step.value = 1
  }, 900)
  const t2 = setTimeout(() => {
    step.value = 2
  }, 1800)
  const t3 = setTimeout(() => {
    clearTimeout(t1)
    clearTimeout(t2)
    userStore.applyFaceVerificationSuccess()
    running.value = false
    uni.showToast({ title: '认证成功（演示）', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/mine/index' }) })
    }, 500)
  }, 2800)
}
</script>

<style scoped lang="scss">
.face-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.glass-row {
  margin: 24rpx 32rpx 0;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.22);
  border: 1rpx solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px);
}

.nav-back {
  font-size: 40rpx;
  color: #4b5563;
  width: 72rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.nav-placeholder {
  width: 72rpx;
}

.face-body {
  flex: 1;
  padding: 32rpx 40rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner {
  width: 100%;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(224, 231, 255, 0.85);
  border: 1rpx solid rgba(165, 180, 252, 0.6);
  margin-bottom: 28rpx;

  text {
    font-size: 24rpx;
    color: #4338ca;
    line-height: 1.45;
  }

  &.warn {
    background: rgba(254, 243, 199, 0.9);
    border-color: rgba(252, 211, 77, 0.6);
  }

  &.warn text {
    color: #92400e;
  }
}

.link {
  margin-top: 12rpx;

  text {
    font-size: 26rpx;
    color: #7c3aed;
    font-weight: 600;
  }
}

.ring-wrap {
  position: relative;
  width: 400rpx;
  height: 400rpx;
  margin: 24rpx 0 36rpx;
}

.ring-outer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 6rpx solid rgba(167, 139, 250, 0.45);
}

.ring-inner {
  position: absolute;
  inset: 36rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.75), rgba(224, 231, 255, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed rgba(139, 92, 246, 0.35);
}

.face-emoji {
  font-size: 120rpx;
}

.corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-color: #8b5cf6;
  border-style: solid;

  &.tl {
    top: 8rpx;
    left: 8rpx;
    border-width: 6rpx 0 0 6rpx;
    border-radius: 40rpx 0 0 0;
  }
  &.tr {
    top: 8rpx;
    right: 8rpx;
    border-width: 6rpx 6rpx 0 0;
    border-radius: 0 40rpx 0 0;
  }
  &.bl {
    bottom: 8rpx;
    left: 8rpx;
    border-width: 0 0 6rpx 6rpx;
    border-radius: 0 0 0 40rpx;
  }
  &.br {
    bottom: 8rpx;
    right: 8rpx;
    border-width: 0 6rpx 6rpx 0;
    border-radius: 0 0 40rpx 0;
  }
}

.face-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.face-desc {
  font-size: 26rpx;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 32rpx;
}

.actions-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.action-chip {
  width: 140rpx;
  padding: 20rpx 0;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.35);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.chip-ico {
  font-size: 36rpx;
}

.chip-t {
  font-size: 22rpx;
  color: #4b5563;
}

.primary-btn {
  width: 100%;
  max-width: 600rpx;
  padding: 28rpx 0;
  border-radius: 32rpx;
  text-align: center;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  box-shadow: 0 8rpx 28rpx rgba(139, 92, 246, 0.35);
  margin-bottom: 28rpx;

  text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }

  &.disabled {
    opacity: 0.65;
    pointer-events: none;
  }
}

.fine-print {
  font-size: 22rpx;
  color: #9ca3af;
  text-align: center;
  line-height: 1.5;
  padding: 0 16rpx;
}
</style>
