<template>
  <view class="page-container gradient-bg auth-page">
    <!-- 流程一：仅微信登录 + 进入手机登录 -->
    <template v-if="!phoneLoginExpanded">
      <view :style="capsuleNavOuterStyle">
        <view class="auth-nav glass-row" :style="capsuleNavRowStyle">
          <view class="auth-nav-back-wrap" hover-class="btn-press" @tap.stop="goBack">
            <text class="auth-nav-back">‹</text>
          </view>
          <text class="auth-nav-title">登录</text>
          <view class="auth-nav-placeholder" />
        </view>
      </view>

      <scroll-view class="auth-scroll" scroll-y show-scrollbar="false" :enable-flex="true">
        <view class="auth-hero">
          <text class="auth-logo font-logo">长情许</text>
          <text class="auth-sub">真实身份 · 真诚交友</text>
        </view>

        <button
          type="button"
          class="wx-btn btn-press"
          :class="{ disabled: loadingWx }"
          :disabled="loadingWx"
          hover-class="wx-btn-hover"
          @tap="onWeChatLogin"
        >
          <text class="wx-icon">💬</text>
          <text>{{ loadingWx ? '登录中…' : '微信一键登录' }}</text>
        </button>
        <text class="wx-hint">演示环境模拟成功；正式版需配置微信开放平台与后端换票。</text>

        <button
          type="button"
          class="phone-entry-btn btn-press"
          :class="{ disabled: loadingWx }"
          :disabled="loadingWx"
          hover-class="phone-entry-hover"
          @tap="openPhoneLogin"
        >
          <text class="phone-entry-icon">📱</text>
          <text class="phone-entry-label">手机号登录</text>
        </button>
      </scroll-view>
    </template>

    <!-- 流程二：整页切换为手机登录，与微信区完全分离；左上角返回微信登录 -->
    <template v-else>
      <view :style="capsuleNavOuterStyle">
        <view class="auth-nav glass-row auth-nav-phone" :style="capsuleNavRowStyle">
          <view class="auth-nav-back-wrap" hover-class="btn-press" @tap.stop="closePhoneLogin">
            <text class="auth-nav-back">‹</text>
          </view>
          <text class="auth-nav-title">验证码登录</text>
          <view class="auth-nav-placeholder" />
        </view>
      </view>

      <scroll-view class="auth-scroll auth-scroll-phone" scroll-y show-scrollbar="false" :enable-flex="true">
        <text class="phone-flow-lead">返回后仍可使用微信一键登录</text>

        <view class="form-section profile-form-card auth-card">
          <view class="row-prefix">
            <text class="prefix">+86</text>
            <input
              v-model="phone"
              class="form-input flex1"
              type="digit"
              maxlength="11"
              placeholder="请输入手机号码"
            />
          </view>
          <view class="row-code">
            <input
              v-model="smsCode"
              class="form-input flex1"
              type="digit"
              maxlength="6"
              placeholder="请输入验证码"
            />
            <button
              type="button"
              class="code-btn btn-press"
              :class="{ disabled: smsCooldown > 0 || smsSending }"
              :disabled="smsCooldown > 0 || smsSending"
              hover-class="code-btn-hover"
              @tap.stop="onSendSms"
            >
              <text>{{ smsCooldown > 0 ? `${smsCooldown}s` : smsSending ? '发送中' : '获取验证码' }}</text>
            </button>
          </view>
          <text class="sms-tip">演示验证码 {{ demoSms }}；填 11 位大陆手机号后可直接登录，也可先点获取验证码。</text>
          <button
            type="button"
            class="auth-submit btn-press"
            :class="{ disabled: loadingSms }"
            :disabled="loadingSms"
            hover-class="auth-submit-hover"
            @tap="submitSms"
          >
            <text>{{ loadingSms ? '登录中…' : '登录' }}</text>
          </button>
        </view>

        <view class="auth-row-center btn-press" @tap="goRegister">
          <text class="auth-link">没有账号？去注册</text>
        </view>

        <view class="auth-footnote">
          <text>演示码 {{ demoSms }} 可直接登录；获取验证码用于走完整演示流程。</text>
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { validatePhone, DEMO_SMS_CODE } from '@/services/auth'
import { apiSendSms } from '@/services/api-auth'
import { useDiscoverStore } from '@/stores/discover'
import { navigateBackTo } from '@/utils/navigation'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())

const userStore = useUserStore()
const discoverStore = useDiscoverStore()
const phone = ref('')
const smsCode = ref('')
/** false：仅微信登录页；true：整页切换为手机登录（与微信区互斥） */
const phoneLoginExpanded = ref(false)

const loadingSms = ref(false)
const loadingWx = ref(false)
const smsSending = ref(false)
const smsCooldown = ref(0)

const demoSms = DEMO_SMS_CODE

let smsTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
  }
})

/** 手机登录子流程内按系统返回：先回到微信登录页，不直接退出页面 */
onBackPress(() => {
  if (phoneLoginExpanded.value) {
    closePhoneLogin()
    return true
  }
  return false
})

function goBack() {
  navigateBackTo('/pages/mine/index')
}

function openPhoneLogin() {
  if (loadingWx.value) return
  phoneLoginExpanded.value = true
}

function closePhoneLogin() {
  phoneLoginExpanded.value = false
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
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
    uni.showToast({ title: '请输入11位大陆手机号（1开头）', icon: 'none', duration: 2200 })
    return
  }
  smsSending.value = true
  uni.showLoading({ title: '发送中', mask: true })
  try {
    await apiSendSms({ phone: p, type: 'login' })
    uni.hideLoading()
    uni.showToast({ title: '演示环境：验证码已就绪', icon: 'success', duration: 1800 })
    startSmsCooldown()
  } catch (e: unknown) {
    uni.hideLoading()
    uni.showToast({
      title: e instanceof Error ? e.message : '发送失败',
      icon: 'none',
      duration: 2200,
    })
  } finally {
    smsSending.value = false
  }
}

async function goDiscoverAfterAuth() {
  try {
    await discoverStore.loadDiscoverPage()
  } catch {
    /* 发现页 onShow 会再拉一次 */
  }
  uni.switchTab({
    url: '/pages/discover/index',
    fail: () => {
      uni.reLaunch({ url: '/pages/discover/index' })
    },
  })
}

async function onWeChatLogin() {
  if (loadingWx.value) return
  loadingWx.value = true
  uni.showLoading({ title: '登录中', mask: true })
  try {
    await userStore.loginByWeChat()
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success', duration: 1200 })
    setTimeout(goDiscoverAfterAuth, 300)
  } catch (e: unknown) {
    uni.hideLoading()
    uni.showToast({ title: e instanceof Error ? e.message : '登录失败', icon: 'none', duration: 2200 })
  } finally {
    loadingWx.value = false
  }
}

async function submitSms() {
  if (loadingSms.value) return
  const p = phone.value.trim()
  const c = smsCode.value.trim()
  if (!validatePhone(p)) {
    uni.showToast({ title: '请输入11位大陆手机号（1开头）', icon: 'none', duration: 2200 })
    return
  }
  if (!/^\d{4,6}$/.test(c)) {
    uni.showToast({ title: '请输入4～6位验证码', icon: 'none', duration: 2200 })
    return
  }
  loadingSms.value = true
  uni.showLoading({ title: '登录中', mask: true })
  try {
    await userStore.loginBySms(p, c)
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success', duration: 1200 })
    setTimeout(goDiscoverAfterAuth, 300)
  } catch (e: unknown) {
    uni.hideLoading()
    uni.showToast({
      title: e instanceof Error ? e.message : '登录失败',
      icon: 'none',
      duration: 2200,
    })
  } finally {
    loadingSms.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.glass-row {
  margin: 0 32rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.22);
  border: 1rpx solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px);
}

.auth-nav-back-wrap {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-nav-back {
  font-size: 44rpx;
  color: #4b5563;
  font-weight: 300;
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

.auth-scroll-phone {
  padding-top: 8rpx;
}

.auth-nav-phone .auth-nav-back {
  text-align: left;
}

.phone-flow-lead {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 28rpx;
  padding: 0 16rpx;
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

/* 小程序内 view 点击在 scroll-view 里易失效，主操作改用 button 并重置默认样式 */
.wx-btn {
  width: 100%;
  margin: 0 0 12rpx;
  padding: 28rpx 0;
  line-height: normal;
  border: none;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 8rpx 28rpx rgba(34, 197, 94, 0.35);

  &::after {
    border: none;
  }

  text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }

  &.disabled {
    opacity: 0.65;
  }
}

.wx-btn-hover {
  opacity: 0.92;
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
  margin-bottom: 20rpx;
}

.phone-entry-btn {
  width: 100%;
  margin: 0 0 24rpx;
  padding: 28rpx 0;
  line-height: normal;
  border: 1rpx solid rgba(255, 255, 255, 0.65);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4rpx 24rpx rgba(91, 33, 182, 0.08);

  &::after {
    border: none;
  }

  &.disabled {
    opacity: 0.55;
  }
}

.phone-entry-hover {
  opacity: 0.92;
}

.phone-entry-icon {
  font-size: 34rpx;
}

.phone-entry-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #4c1d95;
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
  margin: 0;
  padding: 20rpx 24rpx;
  line-height: normal;
  border: 1rpx solid rgba(124, 58, 237, 0.35);
  border-radius: 20rpx;
  background: rgba(124, 58, 237, 0.15);

  &::after {
    border: none;
  }

  text {
    font-size: 26rpx;
    color: #6d28d9;
    font-weight: 500;
  }

  &.disabled {
    opacity: 0.5;
  }
}

.code-btn-hover {
  opacity: 0.88;
}

.sms-tip {
  display: block;
  font-size: 22rpx;
  color: #7c3aed;
  margin-bottom: 24rpx;
  line-height: 1.4;
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
  width: 100%;
  margin: 32rpx 0 0;
  padding: 28rpx 0;
  line-height: normal;
  border: none;
  border-radius: 32rpx;
  text-align: center;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  box-shadow: 0 8rpx 28rpx rgba(139, 92, 246, 0.35);

  &::after {
    border: none;
  }

  text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }

  &.disabled {
    opacity: 0.65;
  }
}

.auth-submit-hover {
  opacity: 0.92;
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
