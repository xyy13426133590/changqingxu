<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航 -->
    <view class="filter-header">
      <view class="back-btn" @click="goBack">
        <text>‹</text>
      </view>
      <text class="header-title">筛选条件</text>
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
          :value="filters.ageMax"
          min="18"
          max="60"
          active-color="#8B5CF6"
          background-color="#E5E7EB"
          block-size="24"
          @change="onAgeChange"
        />
        <view class="slider-labels">
          <text>18岁</text>
          <text class="current">{{ filters.ageMax }}岁</text>
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
            :class="{ active: filters.income.includes(opt) }"
            @click="toggleIncome(opt)"
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

onShow(() => {
  safeHideNativeTabBar()
})

const discoverStore = useDiscoverStore()

// 筛选条件数据
const filters = computed(() => discoverStore.filters)

// 趣味配对选项
const zodiacOptions = [
  { value: 'all', label: '不限', desc: '' },
  { value: 'sanhe', label: '三合 ✨', desc: '猴鼠龙 / 蛇鸡牛 / 虎马狗 / 猪兔羊' },
  { value: 'liuhe', label: '六合 🌟', desc: '鼠牛 / 虎猪 / 兔狗 / 龙鸡 / 蛇猴 / 马羊' },
  { value: 'both', label: '两者皆匹配', desc: '' },
]

// 距离选项
const distanceOptions = [
  { value: 'sameCity', label: '同城' },
  { value: 'sameProvince', label: '同省' },
  { value: 'all', label: '不限' },
]

// 学历选项（单选）
const educationOptions: EducationFilterOption[] = ['大专及以下', '本科', '硕士及以上']

// 年收入选项（与 store 一致，默认选中 10万-20万）
const incomeOptions = [...INCOME_FILTER_OPTIONS]

// 设置生肖配对
function setZodiacMatch(value: 'all' | 'sanhe' | 'liuhe' | 'both') {
  discoverStore.updateFilters({ zodiacMatch: value })
}

// 年龄滑块变化
function onAgeChange(e: { detail: { value: number } }) {
  const value = e.detail.value
  discoverStore.setAgeRange(18, value)
}

// 设置距离
function setDistance(value: 'sameCity' | 'sameProvince' | 'all') {
  discoverStore.updateFilters({ distance: value })
}

// 学历单选
function setEducation(value: EducationFilterOption) {
  discoverStore.setEducation(value)
}

// 切换年收入选中状态
function toggleIncome(value: string) {
  discoverStore.toggleIncome(value)
}

// 返回上一页
function goBack() {
  uni.switchTab({ url: '/pages/discover/index' })
}

// 应用筛选
function applyFilters() {
  discoverStore.applyFilters()
  uni.switchTab({ url: '/pages/discover/index' })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
