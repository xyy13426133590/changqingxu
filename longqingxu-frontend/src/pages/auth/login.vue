<template>
  <view class="page-container gradient-bg auth-page">
    <view class="auth-nav glass-row" @click="goBack">
      <text class="auth-nav-back">‹</text>
      <text class="auth-nav-title">登录</text>
      <view class="auth-nav-placeholder" />
    </view>

    <scroll-view class="auth-scroll" scroll-y show-scrollbar="false">
      <view class="auth-hero">
        <text class="auth-logo font-logo">长情许</text>
        <text class="auth-sub">真实身份 · 真诚交友</text>
      </view>

      <view class="wx-btn" :class="{ disabled: loading }" @click="onWeChatLogin">
        <text class="wx-icon">💬</text>
        <text>{{ loadingWx ? '登录中…' : '微信一键登录' }}</text>
      </view>
      <text class="wx-hint">演示环境模拟成功；正式版需配置微信开放平台与后端换票。</text>

      <view class="divider">
        <view class="divider-line" />
        <text class="divider-text">手机号登录</text>
        <view class="divider-line" />
      </view>

      <view class="mode-tabs">
        <view
          class="mode-tab"
          :class="{ on: phoneMode === 'sms' }"
          @click="phoneMode = 'sms'"
        >
          <text>验证码</text>
        </view>
        <view
          class="mode-tab"
          :class="{ on: phoneMode === 'pwd' }"
          @click="phoneMode = 'pwd'"
        >
          <text>密码</text>
        </view>
      </view>

      <view class="form-section profile-form-card auth-card">
        <template v-if="phoneMode === 'sms'">
          <view class="row-prefix">
            <text class="prefix">+86</text>
            <input
              v-model="phone"
              class="form-input flex1"
              type="number"
              maxlength="11"
              placeholder="请输入手机号码"
            />
          </view>
          <view class="row-code">
            <input
              v-model="smsCode"
              class="form-input flex1"
              type="number"
              maxlength="6"
              placeholder="请输入验证码"
            />
            <view
              class="code-btn"
              :class="{ disabled: smsCooldown > 0 || smsSending }"
              @click="onSendSms"
            >
              <text>{{ smsCooldown > 0 ? `${smsCooldown}s` : smsSending ? '发送中' : '获取验证码' }}</text>
            </view>
          </view>
          <text class="sms-tip">演示验证码：{{ demoSms }}（任意已发短信的手机号均可）</text>
          <view class="auth-submit" :class="{ disabled: loadingSms }" @click="submitSms">
            <text>{{ loadingSms ? '登录中…' : '验证并登录' }}</text>
          </view>
        </template>

        <template v-else>
          <input
            v-model="phone"
            class="form-input"
            type="number"
            maxlength="11"
            placeholder="手机号"
          />
          <input
            v-model="password"
            class="form-input"
            password
            placeholder="密码（6～32 位）"
          />
          <view class="auth-row-between">
            <text class="auth-link" @click="goRegister">注册账号</text>
            <text class="auth-link muted" @click="onForgot">忘记密码</text>
          </view>
          <view class="auth-submit" :class="{ disabled: loadingPwd }" @click="submitPwd">
            <text>{{ loadingPwd ? '登录中…' : '登 录' }}</text>
          </view>
        </template>
      </view>

      <view v-if="phoneMode === 'sms'" class="auth-row-center">
        <text class="auth-link" @click="goRegister">没有账号？去注册</text>
      </view>

      <view class="auth-footnote">
        <text>密码演示：{{ demoPhone }} / {{ demoPwd }}。验证码请先点「获取验证码」，再填 {{ demoSms }}。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  validatePhone,
  validatePassword,
  LOGIN_ERR_ACCOUNT_NOT_FOUND,
  sendSmsCode,
  DEMO_TEST_PHONE,
  DEMO_TEST_PASSWORD,
  DEMO_SMS_CODE,
} from '@/services/auth'

const userStore = useUserStore()
const phone = ref('')
const password = ref('')
const smsCode = ref('')
const phoneMode = ref<'sms' | 'pwd'>('sms')

const loadingPwd = ref(false)
const loadingSms = ref(false)
const loadingWx = ref(false)
const smsSending = ref(false)
const smsCooldown = ref(0)

const demoPhone = DEMO_TEST_PHONE
const demoPwd = DEMO_TEST_PASSWORD
const demoSms = DEMO_SMS_CODE

let smsTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
  }
})

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/mine/index' }) })
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
}

function onForgot() {
  uni.showToast({ title: '演示版请使用验证码登录或重新注册', icon: 'none' })
}

function startSmsCooldown() {
  if (smsTimer) clearInterval(smsTimer)
  smsCooldown.value = 59
  smsTimer = setInterval(() => {
    smsCooldown.value--
    if (smsCooldown.value <= 0 && smsTimer) {
      clearInterval(smsTimer)
      smsTimer = null
    }
  }, 1000)
}

async function onSendSms() {
  if (smsCooldown.value > 0 || smsSending.value) return
  const p = phone.value.trim()
  if (!validatePhone(p)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  smsSending.value = true
  try {
    await sendSmsCode(p)
    uni.showToast({ title: '验证码已记录（演示无真实短信）', icon: 'none' })
    startSmsCooldown()
  } catch (e: unknown) {
    uni.showToast({ title: e instanceof Error ? e.message : '发送失败', icon: 'none' })
  } finally {
    smsSending.value = false
  }
}

async function onWeChatLogin() {
  if (loadingWx.value) return
  loadingWx.value = true
  try {
    await userStore.loginByWeChat()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.switchTab({ url: '/pages/discover/index' }), 400)
  } catch (e: unknown) {
    uni.showToast({ title: e instanceof Error ? e.message : '登录失败', icon: 'none' })
  } finally {
    loadingWx.value = false
  }
}

async function submitSms() {
  if (loadingSms.value) return
  const p = phone.value.trim()
  const c = smsCode.value.trim()
  if (!validatePhone(p)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  if (!/^\d{4,6}$/.test(c)) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  loadingSms.value = true
  try {
    await userStore.loginBySms(p, c)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.switchTab({ url: '/pages/discover/index' }), 400)
  } catch (e: unknown) {
    uni.showToast({ title: e instanceof Error ? e.message : '登录失败', icon: 'none' })
  } finally {
    loadingSms.value = false
  }
}

async function submitPwd() {
  if (loadingPwd.value) return
  const p = phone.value.trim()
  const pwd = password.value.trim()
  if (!validatePhone(p)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  if (!validatePassword(pwd)) {
    uni.showToast({ title: '密码为 6～32 位', icon: 'none' })
    return
  }
  loadingPwd.value = true
  try {
    await userStore.loginByPhone(p, pwd)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.switchTab({ url: '/pages/discover/index' }), 400)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '登录失败'
    if (msg === LOGIN_ERR_ACCOUNT_NOT_FOUND) {
      uni.showModal({
        title: '提示',
        content: '该手机号尚未注册，是否前往注册？',
        confirmText: '去注册',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const q = encodeURIComponent(p)
            uni.navigateTo({ url: `/pages/auth/register?phone=${q}` })
          }
        },
      })
      return
    }
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    loadingPwd.value = false
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
  padding: 16rpx 0 32rpx;
}

.auth-logo {
  font-size: 64rpx;
  color: #5b21b6;
  display: block;
  line-height: 1.2;
}

.auth-sub {
  font-size: 26rpx;
  color: #6b7280;
  margin-top: 12rpx;
  display: block;
}

.wx-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 28rpx 0;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 8rpx 28rpx rgba(34, 197, 94, 0.35);
  margin-bottom: 12rpx;

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

.wx-icon {
  font-size: 36rpx;
}

.wx-hint {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  text-align: center;
  line-height: 1.45;
  margin-bottom: 28rpx;
}

.divider {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: rgba(107, 114, 128, 0.25);
}

.divider-text {
  font-size: 24rpx;
  color: #6b7280;
}

.mode-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.mode-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.22);
  border: 1rpx solid rgba(255, 255, 255, 0.35);

  text {
    font-size: 28rpx;
    color: #6b7280;
  }

  &.on {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.45);

    text {
      color: #5b21b6;
      font-weight: 600;
    }
  }
}

.auth-card {
  margin-bottom: 24rpx;
}

.row-prefix {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 0 24rpx;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.prefix {
  font-size: 28rpx;
  color: #6b7280;
  flex-shrink: 0;
}

.flex1 {
  flex: 1;
  min-width: 0;
}

.row-code {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.row-code .form-input {
  flex: 1;
  margin-bottom: 0;
}

.code-btn {
  flex-shrink: 0;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(124, 58, 237, 0.15);
  border: 1rpx solid rgba(124, 58, 237, 0.35);

  text {
    font-size: 26rpx;
    color: #6d28d9;
    font-weight: 500;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.sms-tip {
  display: block;
  font-size: 22rpx;
  color: #7c3aed;
  margin-bottom: 24rpx;
  line-height: 1.4;
}

.auth-row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.auth-row-center {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.auth-link {
  font-size: 26rpx;
  color: #7c3aed;
  padding: 12rpx 0;

  &.muted {
    color: #9ca3af;
  }
}

.auth-submit {
  margin-top: 32rpx;
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

.auth-footnote {
  padding: 0 8rpx;
  text-align: center;

  text {
    font-size: 22rpx;
    color: #6b7280;
    line-height: 1.5;
  }
}
</style>
