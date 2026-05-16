<template>
  <view class="page-container gradient-bg user-detail-page">
    <view :style="capsuleNavOuterStyle">
      <view class="nav glass user-detail-nav" :style="capsuleNavRowStyle">
        <view class="nav-back-wrap" hover-class="btn-press" @tap.stop="goBack">
          <text class="nav-back">‹ 返回</text>
        </view>
        <text class="nav-title">用户详情</text>
        <view class="nav-right" />
      </view>
    </view>

    <view v-if="loading" class="user-detail-placeholder glass">
      <text class="hint">加载中…</text>
    </view>

    <scroll-view v-else-if="card" class="user-detail-scroll" scroll-y show-scrollbar="false">
      <!-- 头图 -->
      <image class="user-detail-hero" :src="card.avatar" mode="aspectFill" />

      <!-- 昵称 + 认证角标 -->
      <view class="user-detail-section glass">
        <view class="user-detail-name-row">
          <text class="user-detail-name">{{ card.nickname }}</text>
          <text class="user-detail-gender">{{ genderLabel }}</text>
        </view>
        <view v-if="hasVerifyBadges" class="user-detail-badges">
          <text v-if="card.isRealName" class="user-detail-badge real">实名</text>
          <text v-if="card.isFaceVerified" class="user-detail-badge face">人脸</text>
          <text v-if="card.isVip" class="user-detail-badge vip">VIP</text>
        </view>
        <text class="user-detail-summary">{{ summaryLine }}</text>
      </view>

      <!-- 趣味生辰 -->
      <view class="user-detail-section glass">
        <text class="user-detail-section-title">趣味生辰（民俗参考）</text>
        <text class="user-detail-meta-line">{{ folkMetaLine }}</text>
        <text class="user-detail-disclaimer">
          以上仅供娱乐交友展示，不构成测算或宿命论观点。
        </text>
      </view>

      <!-- 教育与职业 -->
      <view class="user-detail-section glass">
        <text class="user-detail-section-title">教育与职业</text>
        <view class="user-detail-kv-grid">
          <view class="user-detail-kv">
            <text class="kv-label">学历</text>
            <text class="kv-value">{{ displayEducation }}</text>
          </view>
          <view v-if="schoolLine" class="user-detail-kv full">
            <text class="kv-label">院校</text>
            <view class="kv-value-row">
              <text class="kv-value">{{ schoolLine }}</text>
              <text v-if="tierTag" class="user-detail-tier">{{ tierTag }}</text>
            </view>
          </view>
          <view class="user-detail-kv">
            <text class="kv-label">职业</text>
            <text class="kv-value">{{ displayOccupation }}</text>
          </view>
          <view v-if="card.jobLevel" class="user-detail-kv">
            <text class="kv-label">职级</text>
            <text class="kv-value">{{ card.jobLevel }}</text>
          </view>
          <view v-if="card.company" class="user-detail-kv full">
            <text class="kv-label">公司</text>
            <text class="kv-value">{{ card.company }}</text>
          </view>
          <view class="user-detail-kv">
            <text class="kv-label">年收入</text>
            <text class="kv-value">{{ displayIncome }}</text>
          </view>
        </view>
      </view>

      <!-- 匹配摘要 -->
      <view class="user-detail-section glass">
        <text class="user-detail-section-title">匹配趣味参考</text>
        <text class="user-detail-match-line">{{ card.matchReason }} · {{ card.matchTagline }}</text>
        <view class="user-detail-score-wrap">
          <view class="user-detail-score-bar">
            <view class="user-detail-score-fill" :style="{ width: matchScorePct + '%' }" />
          </view>
          <text class="user-detail-score-num">{{ clampedScore }} 分</text>
        </view>
      </view>

      <!-- 关于 Ta -->
      <view class="user-detail-section glass">
        <text class="user-detail-section-title">关于 Ta</text>
        <text class="user-detail-bio">{{ bioText }}</text>
      </view>

      <!-- 兴趣爱好 -->
      <view v-if="card.hobbies?.length" class="user-detail-section glass">
        <text class="user-detail-section-title">兴趣爱好</text>
        <view class="user-detail-hobby-tags">
          <text v-for="h in card.hobbies" :key="h" class="user-detail-hobby-chip">{{ h }}</text>
        </view>
      </view>
      <view v-else class="user-detail-section glass user-detail-muted">
        <text class="user-detail-muted-text">暂未填写兴趣爱好</text>
      </view>
    </scroll-view>

    <view v-else class="user-detail-placeholder glass">
      <text class="hint">{{ errorHint || '未找到用户' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { apiGetUserDetail, type UserCard } from '@/services/api-user'
import { resolveAvatar } from '@/utils/avatar'
import { navigateBackTo } from '@/utils/navigation'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'
import { getZodiacEmoji, getZodiacSignSymbol, getRiyuanEmoji } from '@/utils/date'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())
const userId = ref('')
const loading = ref(true)
const card = ref<UserCard | null>(null)
const errorHint = ref('')

const dash = '—'

onLoad((query) => {
  userId.value = (query?.id as string) || ''
  void loadDetail()
})

async function loadDetail() {
  loading.value = true
  card.value = null
  errorHint.value = ''
  const id = userId.value.trim()
  if (!id) {
    loading.value = false
    return
  }
  try {
    const c = await apiGetUserDetail(id)
    card.value = {
      ...c,
      hobbies: Array.isArray(c.hobbies) ? c.hobbies : [],
      avatar: resolveAvatar(c.avatar, c.id),
      isFaceVerified: !!c.isFaceVerified,
    }
  } catch {
    errorHint.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const genderLabel = computed(() => {
  const g = card.value?.gender
  if (g === 'male') return '♂'
  if (g === 'female') return '♀'
  return ''
})

const summaryLine = computed(() => {
  const c = card.value
  if (!c) return ''
  const parts: string[] = []
  if (typeof c.age === 'number' && !Number.isNaN(c.age)) parts.push(`${c.age}岁`)
  parts.push(c.location?.trim() || dash)
  const heightStr =
    typeof c.height === 'number' && !Number.isNaN(c.height) ? `${c.height}cm` : dash
  parts.push(heightStr)
  if (c.weight != null && typeof c.weight === 'number' && !Number.isNaN(c.weight)) {
    parts.push(`${c.weight}kg`)
  }
  const ht = c.hometown?.trim()
  if (ht) parts.push(`籍贯 ${ht}`)
  return parts.join(' · ')
})

const folkMetaLine = computed(() => {
  const c = card.value
  if (!c) return ''
  const z = c.zodiac || '兔'
  const zs = c.zodiacSign || '天秤座'
  const rz = c.riyuan || '甲木'
  return `${getZodiacEmoji(z)} ${z} · ${getZodiacSignSymbol(zs)} ${zs} · ${getRiyuanEmoji(rz)} ${rz} · ${c.mbti || 'INFP'}`
})

const displayEducation = computed(() => card.value?.education?.trim() || dash)
const displayOccupation = computed(() => card.value?.occupation?.trim() || dash)
const displayIncome = computed(() => card.value?.income?.trim() || dash)
const bioText = computed(() => card.value?.bio?.trim() || '暂未填写介绍')

const schoolLine = computed(() => {
  const s = card.value?.school?.trim()
  return s || ''
})

const tierTag = computed(() => {
  const t = card.value?.schoolTier
  if (t === '985') return '985'
  if (t === '211') return '211'
  return ''
})

const hasVerifyBadges = computed(() => {
  const c = card.value
  if (!c) return false
  return !!(c.isRealName || c.isFaceVerified || c.isVip)
})

const clampedScore = computed(() => {
  const s = card.value?.matchScore
  if (typeof s !== 'number' || Number.isNaN(s)) return 0
  return Math.min(100, Math.max(0, Math.round(s)))
})

const matchScorePct = computed(() => clampedScore.value)

function goBack() {
  navigateBackTo('/pages/discover/index')
}
</script>

<style scoped lang="scss">
/* 结构与主样式见全局 .user-detail-* */
.page-container.user-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
</style>
