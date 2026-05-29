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

type TabName = 'discover' | 'filter' | 'circle' | 'messages' | 'mine'

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
  { name: 'circle', pagePath: '/pages/circle/index', text: '圈子' },
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
  background: rgba(15, 15, 26, 0.96);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
  padding: 14rpx 0 calc(14rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  z-index: 10050;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;

    .tab-icon-slot {
      width: 52rpx;
      height: 52rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 0.22s ease, transform 0.22s ease;
    }

    .tab-text {
      font-size: 20rpx;
      color: rgba(255, 255, 255, 0.35);
      letter-spacing: 0.5rpx;
      transition: color 0.22s ease;
    }

    &.active {
      .tab-icon-slot {
        filter: drop-shadow(0 4rpx 12rpx rgba(139, 92, 246, 0.5));
        transform: scale(1.08);
      }

      .tab-text {
        background: linear-gradient(135deg, #c4b5fd, #a5b4fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
      }
    }
  }
}
</style>
