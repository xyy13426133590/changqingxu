<template>
  <view
    class="user-card-wrapper"
    :style="wrapperStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <view class="user-card glass" :style="cardStyle">
      <!-- 照片区域 -->
      <view class="photo-area">
        <image class="user-photo" :src="user.avatar" mode="aspectFill" />
        
        <!-- 照片指示器 -->
        <view class="photo-indicators">
          <view 
            v-for="(_, index) in 3" 
            :key="index"
            class="indicator"
            :class="{ active: currentPhotoIndex === index }"
          />
        </view>
        
        <!-- 认证标识 -->
        <view class="verify-badges">
          <view v-if="user.isRealName" class="verify-badge blue">
            <text class="badge-icon">✓</text>
            <text class="badge-label">实名</text>
          </view>
          <view v-if="user.isVip" class="verify-badge vip">
            <text class="badge-icon">👑</text>
            <text class="badge-label">VIP</text>
          </view>
        </view>
        
        <!-- 举报按钮 -->
        <view class="report-btn" @click.stop="onReport">
          <text>⋯</text>
        </view>
      </view>
      
      <!-- 信息区域 -->
      <view class="info-area">
        <view class="user-header">
          <view class="user-basic">
            <text class="nickname">{{ user.nickname }}</text>
            <text class="gender-icon" :class="user.gender">
              {{ user.gender === 'female' ? '♀' : '♂' }}
            </text>
          </view>
          <view class="match-badge">
            <text class="match-line1">{{ user.matchReason }}</text>
            <text class="match-line2">{{ user.matchTagline }}</text>
            <text class="match-line3">匹配度 {{ user.matchScore }}%</text>
          </view>
        </view>
        
        <view class="user-meta">
          <text>{{ user.age }}岁 · {{ user.location }} · {{ user.height }}cm</text>
        </view>
        
        <!-- 标签 -->
        <view class="tags-row">
          <view class="tag tag-yellow zodiac-glow">
            <text>{{ getZodiacEmoji(user.zodiac) }} {{ user.zodiac }}</text>
          </view>
          <view class="tag tag-blue">
            <text>{{ getZodiacSignEmoji(user.zodiacSign) }} {{ user.zodiacSign }}</text>
          </view>
          <view class="tag tag-amber">
            <text>{{ getRiyuanEmoji(user.riyuan) }} {{ user.riyuan }}</text>
          </view>
          <view class="tag tag-purple tag-mbti">
            <text class="font-mono">{{ user.mbti }}</text>
          </view>
          <view class="tag tag-purple-light">
            <text>📚 {{ user.education }}</text>
          </view>
          <view class="tag tag-green">
            <text>💼 {{ user.occupation }}</text>
          </view>
          <view class="tag tag-orange">
            <text>💰 {{ user.income }}</text>
          </view>
        </view>
        
        <view class="bio-text">
          <text>{{ user.bio }}</text>
        </view>
        
        <view class="hint-text">
          <text class="icon-hint">💡</text>
          <text>{{ user.matchReason }} · 传统民俗趣味参考</text>
        </view>
      </view>
    </view>
    
    <!-- 滑动提示遮罩 -->
    <view v-if="translateX > 50" class="overlay like-overlay">
      <text class="overlay-text">喜欢</text>
    </view>
    <view v-if="translateX < -50" class="overlay dislike-overlay">
      <text class="overlay-text">不喜欢</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserCard } from '@/stores/discover'

const props = defineProps<{
  user: UserCard
}>()

const emit = defineEmits<{
  like: [userId: string]
  dislike: [userId: string]
  report: [userId: string]
}>()

const currentPhotoIndex = ref(0)

// 触摸滑动相关
const touchStartX = ref(0)
const touchStartY = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const rotate = ref(0)
const isAnimating = ref(false)

const wrapperStyle = computed(() => ({
  transform: `translateX(${translateX.value}px) translateY(${translateY.value}px) rotate(${rotate.value}deg)`,
  transition: isAnimating.value ? 'transform 0.3s ease-out' : 'none',
}))

const cardStyle = computed(() => ({
  opacity: 1 - Math.abs(translateX.value) / 500,
}))

function getZodiacEmoji(zodiac: string): string {
  const map: Record<string, string> = {
    '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
    '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
    '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷',
  }
  return map[zodiac] || '🐰'
}

function getZodiacSignEmoji(sign: string): string {
  const map: Record<string, string> = {
    白羊座: '♈',
    金牛座: '♉',
    双子座: '♊',
    巨蟹座: '♋',
    狮子座: '♌',
    处女座: '♍',
    天秤座: '♎',
    天蝎座: '♏',
    射手座: '♐',
    摩羯座: '♑',
    水瓶座: '♒',
    双鱼座: '♓',
  }
  return map[sign] || '⭐'
}

function getRiyuanEmoji(riyuan: string): string {
  if (/甲|乙/.test(riyuan)) return '🌲'
  if (/丙|丁/.test(riyuan)) return '🔥'
  if (/戊|己/.test(riyuan)) return '⛰️'
  if (/庚|辛/.test(riyuan)) return '⚙️'
  return '💧'
}

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isAnimating.value = false
}

function handleTouchMove(e: TouchEvent) {
  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value
  
  translateX.value = deltaX
  translateY.value = deltaY
  rotate.value = deltaX * 0.05
}

function handleTouchEnd() {
  const threshold = 120
  isAnimating.value = true
  
  if (translateX.value > threshold) {
    // 右滑 - 喜欢
    translateX.value = 500
    rotate.value = 30
    setTimeout(() => {
      emit('like', props.user.id)
      resetCard()
    }, 300)
  } else if (translateX.value < -threshold) {
    // 左滑 - 不喜欢
    translateX.value = -500
    rotate.value = -30
    setTimeout(() => {
      emit('dislike', props.user.id)
      resetCard()
    }, 300)
  } else {
    // 复位
    translateX.value = 0
    translateY.value = 0
    rotate.value = 0
  }
}

function resetCard() {
  translateX.value = 0
  translateY.value = 0
  rotate.value = 0
  isAnimating.value = false
}

function onReport() {
  emit('report', props.user.id)
}

// 暴露方法供父组件调用
defineExpose({
  triggerLike: () => {
    isAnimating.value = true
    translateX.value = 500
    rotate.value = 30
    setTimeout(() => {
      emit('like', props.user.id)
      resetCard()
    }, 300)
  },
  triggerDislike: () => {
    isAnimating.value = true
    translateX.value = -500
    rotate.value = -30
    setTimeout(() => {
      emit('dislike', props.user.id)
      resetCard()
    }, 300)
  },
})
</script>

<style scoped lang="scss">
.user-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.user-card {
  width: 100%;
  height: 100%;
  border-radius: 32rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.photo-area {
  position: relative;
  height: 60%;
  
  .user-photo {
    width: 100%;
    height: 100%;
  }
  
  .photo-indicators {
    position: absolute;
    top: 20rpx;
    left: 20rpx;
    right: 20rpx;
    display: flex;
    gap: 8rpx;
    
    .indicator {
      flex: 1;
      height: 4rpx;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 2rpx;
      
      &.active {
        background: #fff;
      }
    }
  }
  
  .verify-badges {
    position: absolute;
    bottom: 20rpx;
    left: 20rpx;
    display: flex;
    gap: 12rpx;
    
    .verify-badge {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      line-height: 1;
      color: #fff;

      .badge-icon {
        font-size: 24rpx;
        line-height: 1;
      }

      .badge-label {
        font-size: 22rpx;
        font-weight: 500;
        line-height: 1;
      }
      
      &.blue {
        background: #3B82F6;
      }
      
      &.vip {
        background: linear-gradient(135deg, #F59E0B, #F97316);
      }
    }
  }
  
  .report-btn {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 64rpx;
    height: 64rpx;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10rpx);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.info-area {
  flex: 1;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  
  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
    
    .user-basic {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .nickname {
        font-size: 40rpx;
        font-weight: 700;
        color: #1F2937;
      }
      
      .gender-icon {
        font-size: 32rpx;
        
        &.female {
          color: #EC4899;
        }
        
        &.male {
          color: #3B82F6;
        }
      }
    }
    
    .match-badge {
      background: linear-gradient(135deg, #8B5CF6, #EC4899);
      padding: 16rpx 22rpx;
      border-radius: 24rpx;
      text-align: center;
      min-width: 168rpx;
      box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.35);

      .match-line1 {
        display: block;
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.92);
        line-height: 1.35;
      }

      .match-line2 {
        display: block;
        font-size: 28rpx;
        font-weight: 700;
        color: #fff;
        margin-top: 8rpx;
        line-height: 1.2;
      }

      .match-line3 {
        display: block;
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.88);
        margin-top: 8rpx;
        line-height: 1.2;
      }
    }
  }
  
  .user-meta {
    font-size: 26rpx;
    color: #6B7280;
    margin-bottom: 20rpx;
  }
  
  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .tag-mbti {
      font-weight: 600;
      letter-spacing: 2rpx;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      padding: 8rpx 16rpx;
      border-radius: 24rpx;
      font-size: 24rpx;
      
      &-yellow {
        background: rgba(251, 191, 36, 0.2);
        color: #B45309;
      }
      
      &-blue {
        background: rgba(147, 197, 253, 0.3);
        color: #1D4ED8;
      }
      
      &-amber {
        background: rgba(252, 211, 77, 0.25);
        color: #92400E;
      }
      
      &-purple {
        background: rgba(167, 139, 250, 0.2);
        color: #6D28D9;
      }
      
      &-purple-light {
        background: rgba(233, 213, 255, 0.4);
        color: #7C3AED;
      }
      
      &-green {
        background: rgba(110, 231, 183, 0.2);
        color: #047857;
      }
      
      &-orange {
        background: rgba(253, 186, 116, 0.3);
        color: #C2410C;
      }
    }
  }
  
  .bio-text {
    font-size: 26rpx;
    color: #4B5563;
    line-height: 1.6;
    margin-bottom: 16rpx;
  }
  
  .hint-text {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 22rpx;
    color: #9CA3AF;
    margin-top: auto;
    
    .icon-hint {
      font-size: 24rpx;
    }
  }
}

.overlay {
  position: absolute;
  top: 40rpx;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
  border: 4rpx solid;
  
  .overlay-text {
    font-size: 48rpx;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  &.like-overlay {
    right: 40rpx;
    border-color: #10B981;
    color: #10B981;
    transform: rotate(15deg);
  }
  
  &.dislike-overlay {
    left: 40rpx;
    border-color: #EF4444;
    color: #EF4444;
    transform: rotate(-15deg);
  }
}

.font-mono {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 1rpx;
}
</style>