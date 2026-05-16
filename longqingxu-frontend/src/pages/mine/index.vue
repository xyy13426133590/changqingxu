<template>
  <view class="page-container gradient-bg">
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
            <view class="guest-btn primary" @click="goLogin">
              <text>登录</text>
            </view>
            <view class="guest-btn outline" @click="goRegister">
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
        <text class="mine-nickname">{{ userStore.profile.nickname || '我' }}</text>
        <text class="mine-hint">完善资料，提升匹配</text>
      </view>

      <scroll-view class="mine-menu-list" scroll-y show-scrollbar="false">
        <view class="mine-menu-item" @click="navigateTo('profile-edit')">
          <view class="menu-left">
            <text class="menu-icon purple">✎</text>
            <text class="menu-text">编辑资料</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="mine-menu-item" @click="navigateTo('my-card')">
          <view class="menu-left">
            <text class="menu-icon orange">🪪</text>
            <text class="menu-text">我的资料卡</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="mine-menu-item" @click="navigateTo('vip-center')">
          <view class="menu-left">
            <text class="menu-icon amber">👑</text>
            <text class="menu-text">会员中心</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="mine-menu-item" @click="goRealName">
          <view class="menu-left">
            <text class="menu-icon green">🪪</text>
            <text class="menu-text">实名认证</text>
          </view>
          <view class="menu-right">
            <text v-if="userStore.profile.isRealName" class="menu-tag on">已认证</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="mine-menu-item" @click="goFaceVerify">
          <view class="menu-left">
            <text class="menu-icon cyan">👤</text>
            <text class="menu-text">人脸认证</text>
          </view>
          <view class="menu-right">
            <text v-if="userStore.profile.isFaceVerified" class="menu-tag on">已认证</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="mine-menu-item" @click="navigateToDiscover">
          <view class="menu-left">
            <text class="menu-icon purple">🧭</text>
            <text class="menu-text">去发现</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="mine-menu-item logout" @click="onLogout">
          <view class="menu-left">
            <text class="menu-icon gray">⎋</text>
            <text class="menu-text logout-text">退出登录</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </scroll-view>
    </template>

    <view class="mine-footer">
      <text class="footer-link" @click="navigateToDiscover">返回首页</text>
    </view>

    <TabBar active="mine" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import TabBar from '@/components/TabBar.vue'
import { DEMO_AVATARS } from '@/utils/avatar'
import { safeHideNativeTabBar } from '@/utils/tabbar'

const defaultAvatar = DEMO_AVATARS[0]
const guestAvatarSrc = DEMO_AVATARS[1]

onShow(() => {
  safeHideNativeTabBar()
  void userStore.hydrateProfile()
})

const userStore = useUserStore()

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
      content: '建议先完成实名认证，再进行人脸核验。演示环境也可跳过证件仅体验人脸页。',
      confirmText: '去实名',
      cancelText: '仅演示人脸',
      success(res) {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/auth/real-name' })
        } else {
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

function navigateToDiscover() {
  uni.switchTab({ url: '/pages/discover/index' })
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

.mine-menu-item.logout {
  margin-top: 16rpx;
  border-top: 1rpx solid rgba(229, 231, 235, 0.6);
  padding-top: 24rpx;
}

.menu-icon.gray {
  opacity: 0.55;
}

.logout-text {
  color: #6b7280 !important;
}
</style>
