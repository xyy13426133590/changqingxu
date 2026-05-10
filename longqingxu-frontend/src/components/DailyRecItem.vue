<template>
  <view class="daily-rec-item" @click="onClick">
    <image class="avatar" :src="user.avatar" mode="aspectFill" />
    <text class="name">{{ user.nickname }}</text>
  </view>
</template>

<script setup lang="ts">
interface User {
  id: string
  nickname: string
  avatar: string
}

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  click: [userId: string]
}>()

function onClick() {
  emit('click', props.user.id)
}
</script>

<style scoped lang="scss">
.daily-rec-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  
  .avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.2);
  }
  
  .name {
    font-size: 22rpx;
    color: #4B5563;
    max-width: 96rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>