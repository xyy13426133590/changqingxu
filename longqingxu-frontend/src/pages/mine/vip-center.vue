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
      <text class="vip-agreement" @tap.stop="openAgreement">开通即表示同意《会员服务协议》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { apiGetVipPlans, apiCreateOrder, apiGetOrder, apiMockPayOrder, type VipPlan, type CreateOrderResult } from '@/services/api-vip'
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

async function pollOrderPaid(orderId: string, maxAttempts = 10, intervalMs = 500): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const o = await apiGetOrder(orderId)
      if (o.status === 'paid') return true
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return false
}

function requestWxPayment(payment: NonNullable<CreateOrderResult['payment']>): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: payment.timeStamp,
      nonceStr: payment.nonceStr,
      package: payment.package,
      signType: payment.signType,
      paySign: payment.paySign,
      success: () => resolve(),
      fail: (err) => reject(err),
    })
  })
}

async function afterPayFlow(orderId: string) {
  await pollOrderPaid(orderId)
  await userStore.hydrateProfile()
  vipStatus.value = await apiGetVipStatus()
  uni.showModal({
    title: '开通成功',
    content: '会员权益已生效，祝您使用愉快。',
    showCancel: false,
  })
}

function openAgreement() {
  void uni.navigateTo({ url: '/pages/legal/member-agreement' })
}

async function buyVip() {
  if (!selectedPlan.value) {
    uni.showToast({ title: '请先选择套餐', icon: 'none' })
    return
  }
  uni.showLoading({ title: '创建订单…', mask: true })
  try {
    const result = await apiCreateOrder({ planId: selectedPlan.value, payMethod: 'wechat' })
    uni.hideLoading()

    if (result.paymentMode === 'live' && result.payment) {
      uni.showLoading({ title: '拉起支付…', mask: true })
      try {
        await requestWxPayment(result.payment)
      } catch (e: unknown) {
        uni.hideLoading()
        const msg = e && typeof e === 'object' && 'errMsg' in e ? String((e as { errMsg?: string }).errMsg) : ''
        if (msg.includes('cancel') || msg.includes('取消')) {
          uni.showToast({ title: '已取消支付', icon: 'none' })
        } else {
          uni.showToast({ title: '支付未完成', icon: 'none' })
        }
        return
      }
      uni.hideLoading()
      await afterPayFlow(result.order.id)
      return
    }

    uni.showModal({
      title: '演示模式',
      content:
        '当前未走真实微信支付（商户号未配置或为 mock）。开发者可在后端设置 VIP_MOCK_PAY=1 后点此模拟开通以测试会员状态。',
      confirmText: '尝试模拟开通',
      cancelText: '知道了',
      success: async (res) => {
        if (!res.confirm) return
        uni.showLoading({ title: '处理中…', mask: true })
        try {
          await apiMockPayOrder(result.order.id)
          await afterPayFlow(result.order.id)
        } catch {
          uni.showToast({ title: '模拟支付不可用（需 NODE_ENV=development 且 VIP_MOCK_PAY=1）', icon: 'none', duration: 3000 })
        } finally {
          uni.hideLoading()
        }
      },
    })
  } catch {
    /* api 层已 toast */
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
