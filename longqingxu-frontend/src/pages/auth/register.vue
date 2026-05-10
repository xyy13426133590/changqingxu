<template>
  <view class="page-container gradient-bg auth-page">
    <view class="auth-nav glass-row" @click="goBack">
      <text class="auth-nav-back">‹</text>
      <text class="auth-nav-title">注册</text>
      <view class="auth-nav-placeholder" />
    </view>

    <scroll-view class="auth-scroll" scroll-y show-scrollbar="false">
      <AuthSafetyTips />
      <view class="auth-hero">
        <text class="auth-hero-title">创建账号</text>
        <text class="auth-sub">完善资料后，匹配更精准</text>
      </view>

      <view class="form-section profile-form-card auth-card">
        <input
          v-model="phone"
          class="form-input"
          type="number"
          maxlength="11"
          placeholder="手机号"
        />
        <input
          v-model="nickname"
          class="form-input"
          maxlength="16"
          placeholder="昵称（2～16 字符）"
        />
        <input
          v-model="password"
          class="form-input"
          password
          placeholder="密码（6～32 位）"
        />
        <input
          v-model="password2"
          class="form-input"
          password
          placeholder="确认密码"
        />
        <view class="auth-agree" @click="agreed = !agreed">
          <view class="auth-check" :class="{ on: agreed }">
            <text v-if="agreed">✓</text>
          </view>
          <text class="auth-agree-text">已阅读并同意《用户协议》与《隐私政策》（演示文案）</text>
        </view>
        <view class="auth-submit" :class="{ disabled: loading || !agreed }" @click="submit">
          <text>{{ loading ? '提交中…' : '注 册' }}</text>
        </view>
      </view>

      <view class="auth-bottom-link">
        <text>已有账号？</text>
        <text class="auth-link" @click="goLogin">去登录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AuthSafetyTips from '@/components/AuthSafetyTips.vue'
import { useUserStore } from '@/stores/user'
import { validatePhone, validatePassword } from '@/services/auth'

const userStore = useUserStore()
const phone = ref('')

onLoad((options) => {
  const ph = options?.phone
  if (typeof ph === 'string' && ph.trim()) {
    try {
      phone.value = decodeURIComponent(ph.trim())
    } catch (_e) {
      phone.value = ph.trim()
    }
  }
})
const nickname = ref('')
const password = ref('')
const password2 = ref('')
const agreed = ref(true)
const loading = ref(false)

function goBack() {
  uni.navigateBack({ fail: () => uni.redirectTo({ url: '/pages/auth/welcome' }) })
}

function goLogin() {
  uni.redirectTo({ url: '/pages/auth/login' })
}

async function submit() {
  if (loading.value || !agreed.value) return
  const p = phone.value.trim()
  const nick = nickname.value.trim()
  const pwd = password.value
  const pwd2 = password2.value

  if (!validatePhone(p)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  if (nick.length < 2 || nick.length > 16) {
    uni.showToast({ title: '昵称为 2～16 字符', icon: 'none' })
    return
  }
  if (!validatePassword(pwd)) {
    uni.showToast({ title: '密码为 6～32 位', icon: 'none' })
    return
  }
  if (pwd !== pwd2) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await userStore.registerByPhone(p, pwd, nick)
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/mine/profile-edit' })
    }, 400)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '注册失败'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-page {
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

.auth-nav-back {
  font-size: 44rpx;
  color: #4b5563;
  font-weight: 300;
  width: 72rpx;
}

.auth-nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
}

.auth-nav-placeholder {
  width: 72rpx;
}

.auth-scroll {
  flex: 1;
  min-height: 0;
  padding: 0 32rpx 48rpx;
}

.auth-hero {
  text-align: center;
  padding: 40rpx 0 32rpx;
}

.auth-hero-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
  display: block;
}

.auth-sub {
  font-size: 26rpx;
  color: #6b7280;
  margin-top: 12rpx;
  display: block;
}

.auth-card {
  margin-bottom: 32rpx;
}

.auth-agree {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 8rpx;
}

.auth-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid #c4b5fd;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rpx;

  text {
    font-size: 22rpx;
    color: #7c3aed;
    font-weight: 700;
  }

  &.on {
    background: rgba(139, 92, 246, 0.15);
    border-color: #8b5cf6;
  }
}

.auth-agree-text {
  flex: 1;
  font-size: 22rpx;
  color: #6b7280;
  line-height: 1.45;
}

.auth-submit {
  margin-top: 28rpx;
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
    opacity: 0.55;
    pointer-events: none;
  }
}

.auth-bottom-link {
  text-align: center;
  font-size: 26rpx;
  color: #6b7280;

  .auth-link {
    color: #7c3aed;
    margin-left: 8rpx;
    font-weight: 600;
  }
}
</style>
