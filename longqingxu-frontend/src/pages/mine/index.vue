<template>
  <view class="page-container gradient-bg" :style="pageTopInsetStyle">
    <!-- 未登录 -->
    <template v-if="!userStore.isLogin">
      <view class="guest-wrap">
        <view class="form-section profile-form-card guest-card">
          <view class="guest-avatar-ring">
            <image
              class="guest-avatar"
              :src="guestAvatarSrc"
              mode="aspectFill"
            />
          </view>
          <text class="guest-title">欢迎来到长情许</text>
          <text class="guest-desc">登录后可编辑资料、查看消息与匹配推荐</text>
          <view class="guest-actions">
            <view class="guest-btn primary" hover-class="btn-press" @tap="goLogin">
              <text>登录</text>
            </view>
            <view class="guest-btn outline" hover-class="btn-press" @tap="goRegister">
              <text>注册账号</text>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 已登录 -->
    <template v-else>
      <view class="mine-header">
        <view class="mine-avatar-wrap">
          <image
            class="mine-avatar"
            :src="userStore.profile.avatar || defaultAvatar"
            mode="aspectFill"
          />
        </view>
        <view class="mine-header-text">
          <text class="mine-nickname">{{ userStore.profile.nickname || '我' }}</text>
          <view class="mine-complete-row">
            <text class="mine-complete-label">资料完善度</text>
            <text class="mine-complete-num">{{ profileCompletenessPercent }}%</text>
          </view>
          <view class="mine-complete-track">
            <view
              class="mine-complete-fill"
              :style="{ width: `${profileCompletenessPercent}%` }"
            />
          </view>
          <text class="mine-hint">完善资料，提升匹配</text>
        </view>
      </view>

      <scroll-view class="mine-menu-list" scroll-y show-scrollbar="false">
        <view
          v-for="item in menuItems"
          :key="item.key"
          class="mine-menu-item"
          :class="{ logout: item.key === 'logout' }"
          hover-class="mine-menu-item--press"
          @tap.stop="onMenuTap(item.key)"
        >
          <view class="menu-left">
            <text class="menu-icon" :class="item.iconClass">{{ item.icon }}</text>
            <text class="menu-text" :class="item.textClass">{{ item.label }}</text>
          </view>
          <view v-if="item.tag" class="menu-right">
            <text class="menu-tag" :class="item.tagTone">{{ item.tag }}</text>
            <text class="menu-arrow">›</text>
          </view>
          <text v-else class="menu-arrow">›</text>
        </view>
      </scroll-view>
    </template>

    <TabBar active="mine" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore, type UserProfile } from '@/stores/user'
import TabBar from '@/components/TabBar.vue'
import { DEMO_AVATARS } from '@/utils/avatar'
import { safeHideNativeTabBar } from '@/utils/tabbar'
import { getCapsulePageTopPaddingStyle } from '@/utils/safe-area'

const pageTopInsetStyle = computed(() => getCapsulePageTopPaddingStyle())

const defaultAvatar = DEMO_AVATARS[0]
const guestAvatarSrc = DEMO_AVATARS[1]

const userStore = useUserStore()

function strFilled(v: string | undefined | null): boolean {
  return typeof v === 'string' && v.trim().length > 0
}

function numFilled(v: number | undefined | null): boolean {
  return v != null && typeof v === 'number' && !Number.isNaN(v)
}

/** 与编辑资料、资料卡展示字段对齐，均分权重 */
function computeProfileCompletenessPercent(p: Partial<UserProfile>): number {
  const checks = [
    strFilled(p.nickname),
    strFilled(p.avatar),
    p.gender === 'male' || p.gender === 'female',
    strFilled(p.birthday) || numFilled(p.age),
    numFilled(p.height),
    numFilled(p.weight),
    strFilled(p.location),
    strFilled(p.hometown),
    strFilled(p.education),
    strFilled(p.school),
    strFilled(p.occupation),
    strFilled(p.jobLevel),
    strFilled(p.company),
    strFilled(p.income),
    strFilled(p.bio),
    (p.hobbies?.length ?? 0) > 0,
    strFilled(p.mbti),
    !!p.isRealName,
    !!p.isFaceVerified,
  ]
  const hit = checks.filter(Boolean).length
  return Math.min(100, Math.round((hit / checks.length) * 100))
}

const profileCompletenessPercent = computed(() =>
  userStore.isLogin ? computeProfileCompletenessPercent(userStore.profile) : 0,
)

onShow(() => {
  safeHideNativeTabBar()
  void userStore.hydrateProfile()
})

/** 认证角标：统一三字——未完成「未认证」、已完成「已认证」 */
const AUTH_TAG_PENDING = '未认证'
const AUTH_TAG_DONE = '已认证'

type MenuItem = {
  key: string
  label: string
  icon: string
  iconClass: string
  textClass?: string
  tag?: string
  tagTone?: 'pending' | 'done'
}

function authMenuTag(done: boolean): Pick<MenuItem, 'tag' | 'tagTone'> {
  return done
    ? { tag: AUTH_TAG_DONE, tagTone: 'done' }
    : { tag: AUTH_TAG_PENDING, tagTone: 'pending' }
}

const menuItems = computed<MenuItem[]>(() => [
  {
    key: 'profile-edit',
    label: '编辑资料',
    icon: '✎',
    iconClass: 'purple',
  },
  {
    key: 'my-card',
    label: '我的资料卡',
    icon: '🪪',
    iconClass: 'orange',
  },
  {
    key: 'vip-center',
    label: '会员中心',
    icon: '👑',
    iconClass: 'amber',
  },
  {
    key: 'real-name',
    label: '实名认证',
    icon: '🪪',
    iconClass: 'green',
    ...authMenuTag(!!userStore.profile.isRealName),
  },
  {
    key: 'face-verify',
    label: '人脸认证',
    icon: '👤',
    iconClass: 'cyan',
    ...authMenuTag(!!userStore.profile.isFaceVerified),
  },
  {
    key: 'discover',
    label: '去发现',
    icon: '🧭',
    iconClass: 'purple',
  },
  {
    key: 'logout',
    label: '退出登录',
    icon: '⎋',
    iconClass: 'gray',
    textClass: 'logout-text',
  },
])

function onMenuTap(key: string) {
  switch (key) {
    case 'profile-edit':
      navigateTo('profile-edit')
      break
    case 'my-card':
      navigateTo('my-card')
      break
    case 'vip-center':
      navigateTo('vip-center')
      break
    case 'real-name':
      goRealName()
      break
    case 'face-verify':
      goFaceVerify()
      break
    case 'discover':
      uni.switchTab({ url: '/pages/discover/index' })
      break
    case 'logout':
      onLogout()
      break
    default:
      break
  }
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/welcome' })
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
}

function goRealName() {
  uni.navigateTo({ url: '/pages/auth/real-name' })
}

/** 人脸核验：已实名则进入识别页；未实名则引导先实名，或选「仅演示」走模拟人脸 */
function goFaceVerify() {
  if (!userStore.profile.isRealName) {
    uni.showModal({
      title: '提示',
      content: '建议先完成实名认证，再进行人脸核验。演示环境也可跳过证件，仅体验人脸页。',
      confirmText: '去实名',
      cancelText: '仅演示',
      success(res) {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/auth/real-name' })
        } else if (res.cancel) {
          uni.navigateTo({ url: '/pages/auth/face-verify?onlyFace=1' })
        }
      },
    })
    return
  }
  uni.navigateTo({ url: '/pages/auth/face-verify' })
}

function navigateTo(page: string) {
  uni.navigateTo({ url: `/pages/mine/${page}` })
}

function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success(res) {
      if (res.confirm) userStore.logout()
    },
  })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.guest-wrap {
  flex: 1;
  min-height: 0;
  padding: 48rpx 32rpx 24rpx;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.guest-card {
  width: 100%;
  max-width: 640rpx;
  text-align: center;
  padding-top: 48rpx !important;
  padding-bottom: 40rpx !important;
}

.guest-avatar-ring {
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto 28rpx;
  border-radius: 50%;
  padding: 6rpx;
  background: linear-gradient(135deg, #c4b5fd, #93c5fd);
  box-sizing: border-box;
}

.guest-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
}

.guest-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
  display: block;
  margin-bottom: 12rpx;
}

.guest-desc {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.5;
  display: block;
  margin-bottom: 40rpx;
  padding: 0 16rpx;
}

.guest-actions {
  display: flex;
  flex-direction: column;
}

.guest-actions .guest-btn + .guest-btn {
  margin-top: 20rpx;
}

.guest-btn {
  padding: 26rpx 0;
  border-radius: 32rpx;
  text-align: center;

  text {
    font-size: 30rpx;
    font-weight: 600;
  }

  &.primary {
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    box-shadow: 0 8rpx 28rpx rgba(139, 92, 246, 0.32);

    text {
      color: #fff;
    }
  }

  &.outline {
    background: rgba(255, 255, 255, 0.35);
    border: 1rpx solid rgba(255, 255, 255, 0.55);

    text {
      color: #5b21b6;
    }
  }
}

.mine-menu-item--press {
  opacity: 0.92;
}

.logout-text {
  color: #6b7280 !important;
}
</style>
