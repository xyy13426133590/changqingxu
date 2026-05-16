<template>
  <view class="page-container gradient-bg auth-flow no-tabbar">
    <view class="nav glass-row">
      <view class="nav-back-wrap" hover-class="btn-press" @tap.stop="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">实名认证</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 不用 scroll-view：内嵌 input 在 H5/小程序上易出现无法聚焦、无法输入 -->
    <view class="flow-scroll">
      <view class="hero">
        <text class="hero-icon">🪪</text>
        <text class="hero-title">填写身份信息</text>
        <text class="hero-desc">请填写与本人一致的真实姓名与身份证号码（演示数据仅存本机）</text>
      </view>

      <view class="card glass">
        <view class="field">
          <text class="label">真实姓名</text>
          <input
            v-model="legalName"
            class="inp"
            type="text"
            confirm-type="next"
            placeholder="请输入真实姓名"
            maxlength="20"
            :adjust-position="true"
          />
        </view>
        <view class="field">
          <text class="label">身份证号码</text>
          <input
            v-model="idCard"
            class="inp"
            type="text"
            confirm-type="done"
            placeholder="请输入18位身份证号（末位可为 X）"
            maxlength="18"
            :adjust-position="true"
          />
        </view>
      </view>

      <view class="warn-tip">
        <text>信息仅用于演示流程；正式环境将加密传输并由合规服务商核验，本页不会上传真实证件影像。</text>
      </view>

      <view class="primary-btn" :class="{ disabled: submitting }" @click="onNext">
        <text>{{ submitting ? '校验中…' : '下一步：人脸识别' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { navigateBackTo } from '@/utils/navigation'

const userStore = useUserStore()
const legalName = ref('')
const idCard = ref('')
const submitting = ref(false)

function goBack() {
  navigateBackTo('/pages/mine/index')
}

function validateIdCard18(id: string): { ok: boolean; msg?: string } {
  const s = id.trim().toUpperCase()
  if (!/^\d{17}[\dX]$/.test(s)) return { ok: false, msg: '请输入18位身份证号码' }
  const y = Number.parseInt(s.slice(6, 10), 10)
  const m = Number.parseInt(s.slice(10, 12), 10) - 1
  const d = Number.parseInt(s.slice(12, 14), 10)
  const birth = new Date(y, m, d)
  if (Number.isNaN(birth.getTime())) return { ok: false, msg: '身份证号日期无效' }
  let age = new Date().getFullYear() - birth.getFullYear()
  const md = new Date().getMonth() - birth.getMonth()
  if (md < 0 || (md === 0 && new Date().getDate() < birth.getDate())) age--
  if (age < 18) return { ok: false, msg: '根据身份证信息需年满18周岁方可使用' }
  if (age > 120) return { ok: false, msg: '身份证信息异常' }
  return { ok: true }
}

function onNext() {
  if (submitting.value) return
  const name = legalName.value.trim()
  const id = idCard.value.trim()
  if (name.length < 2 || name.length > 20) {
    uni.showToast({ title: '请输入2～20字真实姓名', icon: 'none' })
    return
  }
  const idRes = validateIdCard18(id)
  if (!idRes.ok) {
    uni.showToast({ title: idRes.msg || '证件号无效', icon: 'none' })
    return
  }
  submitting.value = true
  setTimeout(() => {
    userStore.setRealNameDraft({ legalName: name, idCard: id.toUpperCase() })
    submitting.value = false
    uni.navigateTo({ url: '/pages/auth/face-verify' })
  }, 320)
}
</script>

<style scoped lang="scss">
.auth-flow {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.auth-top-nav {
  position: relative;
  z-index: 50;
  flex-shrink: 0;
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

.nav-back-wrap {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 51;
}

.nav-back {
  font-size: 40rpx;
  color: #4b5563;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.nav-placeholder {
  width: 72rpx;
}

.flow-scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx 32rpx 48rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.hero {
  text-align: center;
  padding: 32rpx 0 28rpx;
}

.hero-icon {
  font-size: 72rpx;
  display: block;
  margin-bottom: 16rpx;
}

.hero-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
  display: block;
}

.hero-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.5;
  padding: 0 16rpx;
}

.card {
  position: relative;
  z-index: 1;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.22);
}

.field {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 26rpx;
  color: #4b5563;
  display: block;
  margin-bottom: 12rpx;
}

.inp {
  width: 100%;
  min-height: 88rpx;
  line-height: 1.45;
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(167, 139, 250, 0.35);
  font-size: 28rpx;
  color: #1f2937;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  -webkit-user-select: text;
  user-select: text;
}

.warn-tip {
  padding: 0 8rpx 24rpx;

  text {
    font-size: 22rpx;
    color: #6b7280;
    line-height: 1.5;
  }
}

.primary-btn {
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

  &.disabled {
    opacity: 0.65;
    pointer-events: none;
  }
}
</style>
