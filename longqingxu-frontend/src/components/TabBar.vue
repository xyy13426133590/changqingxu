<template>
  <view class="custom-tabbar">
    <view
      v-for="item in tabs"
      :key="item.pagePath"
      class="tab-item"
      :class="{ active: active === item.name }"
      @click="switchTab(item)"
    >
      <view class="tab-icon-slot">
        <TabNavSvg :name="item.name" :active="active === item.name" />
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import TabNavSvg from '@/components/TabNavSvg.vue'

type TabName = 'discover' | 'filter' | 'messages' | 'mine'

interface TabItem {
  name: TabName
  pagePath: string
  text: string
}

const props = defineProps<{
  active: string
}>()

const tabs: TabItem[] = [
  { name: 'discover', pagePath: '/pages/discover/index', text: '发现' },
  { name: 'filter', pagePath: '/pages/filter/index', text: '筛选' },
  { name: 'messages', pagePath: '/pages/messages/index', text: '消息' },
  { name: 'mine', pagePath: '/pages/mine/index', text: '我的' },
]

function switchTab(item: TabItem) {
  if (props.active === item.name) return
  uni.switchTab({ url: item.pagePath })
}
</script>

<style scoped lang="scss">
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  padding: 16rpx 48rpx calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  /* 高于 uni-h5 内置 tabbar，避免首帧叠层时压住自定义图标 */
  z-index: 10050;

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .tab-icon-slot {
      width: 52rpx;
      height: 52rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 0.22s ease;
      margin-bottom: 8rpx;
    }

    .tab-text {
      font-size: 22rpx;
      color: #9CA3AF;
    }

    &.active {
      .tab-icon-slot {
        /* 与未选中保持同尺寸，避免四个里有一个偏大 */
        filter: drop-shadow(0 6rpx 14rpx rgba(139, 92, 246, 0.42));
      }

      .tab-text {
        color: #8B5CF6;
        font-weight: 600;
      }
    }
  }
}
</style>
