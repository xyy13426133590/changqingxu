<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航 -->
    <view class="vip-header">
      <view class="back-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="title">会员中心</text>
    </view>

    <!-- 内容区 -->
    <scroll-view class="vip-content" scroll-y show-scrollbar="false">
      <!-- VIP 状态卡片 -->
      <view class="vip-status-card">
        <view class="vip-header-row">
          <view class="vip-icon">
            <text>👑</text>
          </view>
          <view class="vip-info">
            <text class="vip-title">月度 VIP</text>
            <text class="vip-expiry">有效期至 2026-06-01（示意）</text>
          </view>
        </view>
        <view class="vip-stats">
          <view class="stat-item">
            <text class="stat-value">∞</text>
            <text class="stat-label">无限打招呼</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">32</text>
            <text class="stat-label">查看联系方式</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">128</text>
            <text class="stat-label">被查看次数</text>
          </view>
        </view>
      </view>

      <!-- 套餐选择 -->
      <view class="plan-list">
        <text class="section-title">选择套餐</text>

        <view
          v-for="plan in plans"
          :key="plan.id"
          class="plan-item"
          :class="{ active: selectedPlan === plan.id }"
          @click="selectedPlan = plan.id"
        >
          <text v-if="plan.tag" class="plan-tag">{{ plan.tag }}</text>
          <view class="plan-header">
            <view>
              <text class="plan-name">{{ plan.name }}</text>
              <text class="plan-desc">{{ plan.duration }}天全部权益</text>
            </view>
            <view class="plan-price-wrap">
              <text class="plan-price">¥{{ plan.price }}</text>
              <text v-if="plan.originalPrice" class="plan-original">¥{{ plan.originalPrice }}</text>
              <text v-if="plan.save" class="plan-save">省¥{{ plan.save }}</text>
            </view>
          </view>
          <view class="plan-features">
            <text v-for="feature in plan.features" :key="feature" class="feature-tag">{{ feature }}</text>
          </view>
        </view>
      </view>

      <!-- 权益列表 -->
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

    <!-- 底部购买 -->
    <view class="vip-footer">
      <view class="vip-buy-btn" @click="buyVip">
        <text>立即开通 ¥68/月（示意）</text>
      </view>
      <text class="vip-agreement">开通即表示同意《会员服务协议》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const selectedPlan = ref('monthly')

const plans = [
  {
    id: 'monthly',
    name: '月度 VIP',
    duration: 30,
    price: 68,
    originalPrice: 88,
    save: 20,
    tag: '最受欢迎',
    features: ['无限打招呼', '查看联系方式'],
  },
  {
    id: 'quarterly',
    name: '季度 VIP',
    duration: 90,
    price: 168,
    save: 36,
    features: [],
  },
  {
    id: 'yearly',
    name: '年度 VIP',
    duration: 365,
    price: 498,
    save: 318,
    features: [],
  },
]

const benefits = [
  { icon: '💬', title: '无限打招呼', desc: '不再受每日次数限制' },
  { icon: '📞', title: '查看联系方式', desc: '获取对方微信号或手机号' },
  { icon: '🔥', title: '优先推荐', desc: '资料获得更多曝光' },
  { icon: '👁️', title: '访客记录', desc: '查看谁浏览过你的资料' },
]

function buyVip() {
  uni.showToast({ title: '支付功能开发中', icon: 'none' })
}

function goBack() {
  uni.navigateBack({
    fail: () => uni.switchTab({ url: '/pages/mine/index' }),
  })
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