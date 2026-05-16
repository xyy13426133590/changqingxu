<template>
  <view class="page-container gradient-bg">
    <view :style="capsuleNavOuterStyle">
      <view class="vip-header" :style="capsuleNavRowStyle">
        <view class="back-btn" hover-class="btn-press" @tap.stop="goBack">
          <text>‹</text>
        </view>
        <text class="title">会员中心</text>
      </view>
    </view>

    <scroll-view class="vip-content" scroll-y show-scrollbar="false">
      <view class="vip-status-card">
        <view class="vip-header-row">
          <view class="vip-icon">
            <text>👑</text>
          </view>
          <view class="vip-info">
            <text class="vip-title">{{ userStore.profile.isVip ? 'VIP 会员' : '尚未开通 VIP' }}</text>
            <text class="vip-expiry">{{ vipExpiryText }}</text>
          </view>
        </view>
        <view v-if="vipStatus.daysRemaining != null && userStore.profile.isVip" class="vip-stats">
          <view class="stat-item">
            <text class="stat-value">{{ vipStatus.daysRemaining }}</text>
            <text class="stat-label">剩余天数</text>
          </view>
        </view>
      </view>

      <view class="plan-list">
        <text class="section-title">选择套餐</text>
        <text v-if="loadError" class="load-error">{{ loadError }}</text>

        <view
          v-for="plan in plans"
          :key="plan.id"
          class="plan-item"
          :class="{ active: selectedPlan === plan.id }"
          @click="selectedPlan = plan.id"
        >
          <text v-if="plan.tag" class="plan-tag">{{ plan.tag }}</text>
          <view class="plan-header">
            <view class="plan-main">
              <text class="plan-name">{{ plan.name }}</text>
              <text class="plan-desc">约 {{ planDurationDays(plan) }} 天权益周期</text>
            </view>
            <view class="plan-price-wrap">
              <text class="plan-price">¥{{ plan.price }}</text>
              <text v-if="plan.originalPrice" class="plan-original">¥{{ plan.originalPrice }}</text>
              <text
                v-if="plan.originalPrice != null && plan.originalPrice > plan.price"
                class="plan-save"
              >
                省¥{{ plan.originalPrice - plan.price }}
              </text>
            </view>
          </view>
          <view class="plan-features">
            <text v-for="feature in plan.features" :key="feature" class="feature-tag">{{ feature }}</text>
          </view>
        </view>
      </view>

      <view class="benefits-section">
        <text class="section-title">会员权益</text>
        <view class="benefits-list">
          <view v-for="benefit in benefits" :key="benefit.title" class="benefit-item">
            <view class="benefit-icon">
              <text>{{ benefit.icon }}</text>
            </view>
            <view class="benefit-info">
              <text class="benefit-title">{{ benefit.title }}</text>
              <text class="benefit-desc">{{ benefit.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="vip-footer">
      <view class="vip-buy-btn" @click="buyVip">
        <text>{{ buyButtonLabel }}</text>
      </view>
      <text class="vip-agreement">开通即表示同意《会员服务协议》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { apiGetVipPlans, apiCreateOrder, type VipPlan } from '@/services/api-vip'
import { apiGetVipStatus } from '@/services/api-user'
import { navigateBackTo } from '@/utils/navigation'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())

const userStore = useUserStore()

const plans = ref<VipPlan[]>([])
const selectedPlan = ref('')
const loadError = ref('')
const vipStatus = ref<{ isVip: boolean; vipExpiry: string; daysRemaining: number }>({
  isVip: false,
  vipExpiry: '',
  daysRemaining: 0,
})

const benefits = [
  { icon: '💬', title: '无限打招呼', desc: '不再受每日次数限制' },
  { icon: '📞', title: '查看联系方式', desc: '获取对方微信号或手机号' },
  { icon: '🔥', title: '优先推荐', desc: '资料获得更多曝光' },
  { icon: '👁️', title: '访客记录', desc: '查看谁浏览过你的资料' },
]

function planDurationDays(plan: VipPlan): number {
  return Math.round((plan.durationMonths || 1) * 30)
}

const vipExpiryText = computed(() => {
  if (!userStore.profile.isVip) return '开通后享专属特权'
  if (userStore.profile.vipExpiry) {
    try {
      return `有效期至 ${new Date(userStore.profile.vipExpiry).toLocaleDateString()}`
    } catch {
      return '有效期见个人资料'
    }
  }
  return '有效期见个人资料'
})

const buyButtonLabel = computed(() => {
  const p = plans.value.find((x) => x.id === selectedPlan.value)
  return p ? `立即开通 ¥${p.price}` : '请先选择套餐'
})

async function load() {
  loadError.value = ''
  try {
    const [{ plans: list }, vip] = await Promise.all([apiGetVipPlans(), apiGetVipStatus()])
    plans.value = list
    vipStatus.value = vip
    if (list.length && !selectedPlan.value) {
      selectedPlan.value = list[0].id
    }
  } catch {
    loadError.value = '套餐加载失败，请稍后重试'
    plans.value = []
  }
}

onMounted(() => void load())

async function buyVip() {
  if (!selectedPlan.value) {
    uni.showToast({ title: '请先选择套餐', icon: 'none' })
    return
  }
  uni.showLoading({ title: '创建订单…', mask: true })
  try {
    await apiCreateOrder({ planId: selectedPlan.value, payMethod: 'wechat' })
    uni.showToast({ title: '订单已创建（演示环境未完成支付闭环）', icon: 'none', duration: 2200 })
    await userStore.hydrateProfile()
    vipStatus.value = await apiGetVipStatus()
  } catch {
    /* toast handled in api.ts */
  } finally {
    uni.hideLoading()
  }
}

function goBack() {
  navigateBackTo('/pages/mine/index')
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.load-error {
  display: block;
  font-size: 26rpx;
  color: #b91c1c;
  margin-bottom: 16rpx;
}
</style>
