<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航 -->
    <view class="my-card-header">
      <view class="back-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="title">我的资料卡</text>
    </view>

    <!-- 资料卡展示 -->
    <scroll-view class="card-preview" scroll-y show-scrollbar="false">
      <view class="card-container">
        <view class="card-content">
          <!-- 品牌区 -->
          <view class="card-brand">
            <text class="brand-name">长情许</text>
            <text class="brand-slogan">在本小程序内沟通，更安全</text>
          </view>

          <view class="divider"></view>

          <!-- 用户信息 -->
          <view class="card-info-row">
            <image class="card-avatar" :src="userStore.profile.avatar" mode="aspectFill" />
            <view class="card-info">
              <view class="info-name-row">
                <text class="name">{{ userStore.profile.nickname }}</text>
                <text class="age">{{ userStore.profile.age != null ? userStore.profile.age + '岁' : '年龄保密' }}</text>
                <text class="mbti-tag">{{ userStore.profile.mbti }}</text>
              </view>
              <view class="info-detail">
                <text>{{ getZodiacEmoji(userStore.profile.zodiac || '兔') }} {{ userStore.profile.zodiac || '兔' }} · ♎ {{ userStore.profile.zodiacSign || '天秤座' }}</text>
              </view>
              <view class="info-detail">
                <text>📍 {{ userStore.profile.location || '北京' }} · {{ userStore.profile.education || '本科' }} · {{ userStore.profile.occupation || '产品经理' }}</text>
              </view>
              <view class="info-detail">
                <text>💰 年收入 {{ userStore.profile.income || '20万-30万' }}</text>
              </view>
            </view>
          </view>

          <!-- 自我介绍 -->
          <view class="card-bio">
            <text>{{ userStore.profile.bio || '喜欢旅行、摄影、烘焙，期待遇见有趣的你～' }}</text>
          </view>

          <!-- 兴趣爱好 -->
          <view class="card-hobbies" v-if="userStore.profile.hobbies?.length">
            <text class="hobby-label">兴趣爱好</text>
            <view class="hobby-list">
              <text v-for="hobby in userStore.profile.hobbies" :key="hobby" class="hobby-item">{{ hobby }}</text>
            </view>
          </view>

          <!-- 认证状态 -->
          <view class="card-verify">
            <text v-if="userStore.profile.isRealName" class="verify-tag realname">✓ 真实身份已认证</text>
            <text class="verify-tag safety">仅站内聊天，不跳转外链</text>
          </view>
        </view>
      </view>

      <view class="card-hint">
        <text>与意向用户请使用「开始聊天」进入消息页；勿引导至第三方平台或转账。</text>
      </view>
    </scroll-view>

    <!-- 底部操作 -->
    <view class="card-actions">
      <view class="close-btn" @click="goBack">
        <text>✕</text>
      </view>
      <view class="chat-btn" @click="goToMessages">
        <text>💬</text>
        <text>开始聊天</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { getZodiacEmoji } from '@/utils/date'

const userStore = useUserStore()

function getZodiacEmojiSafe(zodiac: string): string {
  return getZodiacEmoji(zodiac) || '🐰'
}

function goBack() {
  uni.navigateBack({
    fail: () => uni.switchTab({ url: '/pages/mine/index' }),
  })
}

function goToMessages() {
  uni.switchTab({ url: '/pages/messages/index' })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.back-btn {
  margin-right: 72rpx;
}
</style>