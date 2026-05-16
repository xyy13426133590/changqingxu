<template>
  <view class="page-container gradient-bg">
    <view :style="capsuleNavOuterStyle">
      <view class="my-card-header" :style="capsuleNavRowStyle">
        <view class="back-btn" hover-class="btn-press" @tap.stop="goBack">
          <text>‹</text>
        </view>
        <text class="title">我的资料卡</text>
      </view>
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
              <view class="info-detail info-detail--meta">
                <text>{{ metaZodiacEmoji }} {{ metaZodiac }} · {{ metaSignSymbol }} {{ metaZodiacSign }} · {{ metaRiyuanEmoji }} {{ metaRiyuan }}</text>
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
            <text>{{ userStore.profile.bio || '喜欢旅行、摄影和烘焙，期待遇见有趣的你～' }}</text>
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
      <view class="close-btn" hover-class="btn-press" @tap.stop="goBack">
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
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  getBirthInfo,
  getZodiacEmoji,
  getZodiacSignSymbol,
  getRiyuanEmoji,
} from '@/utils/date'
import { navigateBackTo } from '@/utils/navigation'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())

const userStore = useUserStore()

const metaZodiac = computed(() => userStore.profile.zodiac || '兔')

const metaZodiacSign = computed(() => userStore.profile.zodiacSign || '天秤座')

const metaRiyuan = computed(() => {
  if (userStore.profile.riyuan) return userStore.profile.riyuan
  const birthday = userStore.profile.birthday
  if (birthday) {
    const d = new Date(birthday)
    if (!Number.isNaN(d.getTime())) {
      return getBirthInfo(d).riyuan
    }
  }
  return '甲木'
})

const metaZodiacEmoji = computed(() => getZodiacEmoji(metaZodiac.value))

const metaSignSymbol = computed(() => getZodiacSignSymbol(metaZodiacSign.value))

const metaRiyuanEmoji = computed(() => getRiyuanEmoji(metaRiyuan.value))

onMounted(() => {
  void userStore.hydrateProfile()
})

function goBack() {
  navigateBackTo('/pages/mine/index')
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

.info-detail--meta {
  margin-bottom: 8rpx;
}

.info-detail--meta text {
  display: block;
  font-size: 24rpx;
  line-height: 1.45;
  word-break: break-all;
}
</style>
