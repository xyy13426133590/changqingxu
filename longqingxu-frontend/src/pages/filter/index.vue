<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航（与微信小程序胶囊垂直对齐） -->
    <view :style="capsuleNavOuterStyle">
      <view class="filter-header" :style="capsuleNavRowStyle">
        <view class="back-btn" hover-class="btn-press" @tap.stop="goBack">
          <text>‹</text>
        </view>
        <text class="header-title">筛选条件</text>
      </view>
    </view>

    <!-- 筛选内容区 -->
    <scroll-view class="filter-content" scroll-y show-scrollbar="false">
      <!-- 趣味配对模块 -->
      <view class="filter-section glass">
        <view class="filter-title">
          <text class="title-icon">✨</text>
          <text>趣味配对（民俗参考）</text>
        </view>
        <view class="filter-grid-2">
          <view
            v-for="opt in zodiacOptions"
            :key="opt.value"
            class="filter-option"
            :class="{ active: filters.zodiacMatch === opt.value }"
            @click="setZodiacMatch(opt.value)"
          >
            <text class="option-title">{{ opt.label }}</text>
            <text v-if="opt.desc" class="option-desc">{{ opt.desc }}</text>
          </view>
        </view>
        <view class="filter-hint">
          <text>生肖三合六合仅为传统民俗文化参考，仅供娱乐交友使用</text>
        </view>
      </view>

      <!-- 年龄范围模块 -->
      <view class="filter-section glass">
        <view class="filter-title">年龄范围</view>
        <slider
          :value="ageMaxDisplay"
          min="18"
          max="60"
          active-color="#8B5CF6"
          background-color="#E5E7EB"
          block-size="24"
          @change="onAgeChange"
        />
        <view class="slider-labels">
          <text>18岁</text>
          <text class="current">{{ ageMaxDisplay }}岁</text>
          <text>60岁</text>
        </view>
      </view>

      <!-- 距离模块 -->
      <view class="filter-section glass">
        <view class="filter-title">距离</view>
        <view class="filter-buttons">
          <view
            v-for="opt in distanceOptions"
            :key="opt.value"
            class="filter-btn"
            :class="{ active: filters.distance === opt.value }"
            @click="setDistance(opt.value)"
          >
            {{ opt.label }}
          </view>
        </view>
      </view>

      <!-- 学历模块 -->
      <view class="filter-section glass">
        <view class="filter-title">学历</view>
        <view class="filter-tags">
          <view
            v-for="opt in educationOptions"
            :key="opt"
            class="filter-tag"
            :class="{ active: filters.education === opt }"
            @click="setEducation(opt)"
          >
            {{ opt }}
          </view>
        </view>
      </view>

      <!-- 年收入模块 -->
      <view class="filter-section glass">
        <view class="filter-title">年收入</view>
        <view class="filter-tags">
          <view
            v-for="opt in incomeOptions"
            :key="opt"
            class="filter-tag"
            :class="{ active: filters.income === opt }"
            @click="setIncome(opt)"
          >
            {{ opt }}
          </view>
        </view>
      </view>

      <!-- 应用筛选按钮 -->
      <view class="apply-btn-wrapper">
        <view class="apply-btn" @click="applyFilters">
          <text>应用筛选</text>
        </view>
      </view>
    </scroll-view>

    <!-- 自定义 TabBar -->
    <TabBar active="filter" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  useDiscoverStore,
  type EducationFilterOption,
  INCOME_FILTER_OPTIONS,
} from '@/stores/discover'
import TabBar from '@/components/TabBar.vue'
import { safeHideNativeTabBar } from '@/utils/tabbar'
import { navigateBackTo } from '@/utils/navigation'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())

onShow(() => {
  safeHideNativeTabBar()
  discoverStore.repairFiltersState()
})

const discoverStore = useDiscoverStore()

// 筛选条件数据
const filters = computed(() => discoverStore.filters)

const ageMaxDisplay = computed(() => {
  const v = filters.value.ageMax
  if (typeof v === 'number' && !Number.isNaN(v)) return Math.min(60, Math.max(18, v))
  return 35
})

type ZodiacMatchFilter = 'all' | 'sanhe' | 'liuhe' | 'both'
type DistanceFilter = 'sameCity' | 'sameProvince' | 'all'

// 趣味配对选项
const zodiacOptions: { value: ZodiacMatchFilter; label: string; desc: string }[] = [
  { value: 'all', label: '不限', desc: '' },
  { value: 'sanhe', label: '三合 ✨', desc: '猴鼠龙 / 蛇鸡牛 / 虎马狗 / 猪兔羊' },
  { value: 'liuhe', label: '六合 🌟', desc: '鼠牛 / 虎猪 / 兔狗 / 龙鸡 / 蛇猴 / 马羊' },
  { value: 'both', label: '两者皆匹配', desc: '' },
]

// 距离选项
const distanceOptions: { value: DistanceFilter; label: string }[] = [
  { value: 'sameCity', label: '同城' },
  { value: 'sameProvince', label: '同省' },
  { value: 'all', label: '不限' },
]

// 学历选项（单选）
const educationOptions: EducationFilterOption[] = ['大专及以下', '本科', '硕士及以上']

// 年收入选项（单选，与 store 一致）
const incomeOptions = [...INCOME_FILTER_OPTIONS]

// 设置生肖配对
function setZodiacMatch(value: ZodiacMatchFilter) {
  discoverStore.updateFilters({ zodiacMatch: value })
}

// 年龄滑块变化（小程序 detail.value 可能为字符串）
function onAgeChange(e: { detail: { value: number | string } }) {
  const value = Number(e.detail.value)
  const max = Number.isFinite(value) ? Math.min(60, Math.max(18, value)) : 35
  discoverStore.setAgeRange(18, max)
}

// 设置距离
function setDistance(value: DistanceFilter) {
  discoverStore.updateFilters({ distance: value })
}

// 学历单选
function setEducation(value: EducationFilterOption) {
  discoverStore.setEducation(value)
}

function setIncome(value: string) {
  discoverStore.setIncomeFilter(value)
}

// 返回上一页
function goBack() {
  navigateBackTo('/pages/discover/index')
}

// 应用筛选
async function applyFilters() {
  uni.showLoading({ mask: true, title: '应用筛选…' })
  try {
    await discoverStore.applyFilters()
  } finally {
    uni.hideLoading()
    uni.switchTab({ url: '/pages/discover/index' })
  }
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
