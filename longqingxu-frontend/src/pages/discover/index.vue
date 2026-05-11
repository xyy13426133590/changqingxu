<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left">
        <view class="avatar-ripple-small">
          <image
            class="avatar-img"
            :src="userStore.profile.avatar || headerAvatarFallback"
            mode="aspectFill"
          />
        </view>
        <text class="logo-text font-logo">长情许</text>
      </view>
      <view class="header-right">
        <view class="icon-btn glass btn-press" @click="navigateToFilter">
          <text class="header-icon" aria-label="筛选">☰</text>
        </view>
        <view class="icon-btn glass relative btn-press" @click="navigateToMessages">
          <text class="header-icon" aria-label="消息">🔔</text>
          <view v-if="messagesStore.totalUnread > 0" class="badge-dot">
            {{ messagesStore.totalUnread > 99 ? '99+' : messagesStore.totalUnread }}
          </view>
        </view>
      </view>
    </view>

    <!-- 每日推荐 -->
    <view class="daily-section glass">
      <view class="daily-header">
        <view class="daily-title">
          <text class="icon-sparkle">✨</text>
          <text class="title-text">每日推荐 · 最新恋友</text>
        </view>
      </view>
      <scroll-view class="daily-scroll" scroll-x show-scrollbar="false">
        <view class="daily-list anim-stagger">
          <view
            v-for="user in dailyUsers"
            :key="user.id"
            class="daily-item"
            @click="navigateToUserDetail(user.id)"
          >
            <image class="daily-avatar anim-avatar" :src="user.avatar" mode="aspectFill" />
            <text class="daily-name">{{ user.nickname }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 用户卡片区域 -->
    <view class="card-container">
      <view
        v-if="currentUser"
        class="user-card glass"
        :style="cardStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @tap="handleCardTap"
      >
        <!-- 喜欢/右滑：cx-heart「极光弧抛」；不喜欢/左滑：cx-pass「裂隙坍缩」 -->
        <transition :name="cardTransitionName" mode="out-in" :appear="false">
          <view v-if="currentUser" :key="currentUser.id" class="user-card-body">
        <!-- 照片区域 -->
        <view class="photo-area">
          <image
            class="user-photo"
            :src="cardAvatarSrc"
            mode="aspectFill"
            @error="onCardAvatarError"
          />
          
          <!-- 左滑右滑反馈层 -->
          <view class="swipe-feedback swipe-like" :style="{ opacity: likeOverlayOpacity }">
            <text class="swipe-feedback-text">喜欢</text>
          </view>
          <view class="swipe-feedback swipe-pass" :style="{ opacity: passOverlayOpacity }">
            <text class="swipe-feedback-text">不喜欢</text>
          </view>
          
          <!-- 照片指示器 -->
          <view class="photo-indicators">
            <view class="indicator active"></view>
            <view class="indicator"></view>
            <view class="indicator"></view>
          </view>
          
          <!-- 认证标识 -->
          <view class="verify-badges">
            <view v-if="currentUser.isRealName" class="verify-badge">
              <text class="badge-icon">✓</text>
              <text class="badge-label">实名</text>
            </view>
            <view v-if="currentUser.isVip" class="vip-badge-mini">
              <text class="badge-icon">👑</text>
              <text class="badge-label">VIP</text>
            </view>
          </view>
          
          <!-- 举报按钮 -->
          <view class="report-btn" @click.stop="openReportFlow('home')">
            <text class="icon-more">⋯</text>
          </view>
        </view>
        
        <!-- 信息区域 -->
        <view class="info-area">
          <view class="user-header">
            <view class="user-basic">
              <view class="user-name-inline">
                <text class="nickname">{{ currentUser.nickname }}</text>
                <text class="gender-icon" :class="currentUser.gender">{{ currentUser.gender === 'female' ? '♀' : '♂' }}</text>
              </view>
            </view>
            <view class="match-badge-compact">
              <text class="match-line1">{{ currentUser.matchReason }}</text>
              <text class="match-line2">{{ currentUser.matchTagline }}</text>
              <text class="match-line3">匹配度 {{ currentUser.matchScore }}%</text>
            </view>
          </view>
          
          <view class="user-meta">
            <text>{{ currentUser.age }}岁 · {{ currentUser.location }} · {{ currentUser.height }}cm</text>
          </view>
          
          <!-- 标签区 -->
          <view class="tags-row">
            <view class="tag-yellow zodiac-glow">
              <text>{{ getZodiacEmoji(currentUser.zodiac) }} {{ currentUser.zodiac }}</text>
            </view>
            <view class="tag-blue">
              <text>{{ getZodiacSignEmoji(currentUser.zodiacSign) }} {{ currentUser.zodiacSign }}</text>
            </view>
            <view class="tag-amber">
              <text>{{ getRiyuanEmoji(currentUser.riyuan) }} {{ currentUser.riyuan }}</text>
            </view>
            <view class="tag-purple tag-mbti">
              <text class="font-mono">{{ currentUser.mbti }}</text>
            </view>
            <view class="tag-purple-light">
              <text>📚 {{ currentUser.education }}</text>
            </view>
            <view class="tag-green">
              <text>💼 {{ currentUser.occupation }}</text>
            </view>
            <view class="tag-orange">
              <text>💰 {{ currentUser.income }}</text>
            </view>
          </view>
          
          <view class="bio-text">
            <text>{{ currentUser.bio }}</text>
          </view>
          
          <view class="hint-text">
            <text class="icon-hint">💡</text>
            <text>{{ currentUser.matchReason }} · 传统民俗趣味参考</text>
          </view>
        </view>
          </view>
        </transition>
      </view>
      
      <!-- 滑动提示 -->
      <view class="swipe-hints">
        <text class="hint-left">← 不喜欢</text>
        <text class="hint-right">喜欢 →</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-btn dislike" @click="commitPass">
        <text class="btn-icon">✕</text>
      </view>
      <view class="action-btn greeting" @click="handleGreeting">
        <text class="btn-icon">♥</text>
        <text class="btn-text">打招呼</text>
      </view>
      <view class="action-btn like" @click="commitLike">
        <text class="btn-icon">★</text>
      </view>
    </view>

    <!-- 自定义 TabBar -->
    <TabBar active="discover" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useDiscoverStore } from '@/stores/discover'
import { useUserStore } from '@/stores/user'
import { useMessagesStore } from '@/stores/messages'
import TabBar from '@/components/TabBar.vue'
import { safeHideNativeTabBar } from '@/utils/tabbar'

/** 与发现页卡片同源：直连演示图（小程序需在后台配置 download 合法域名 images.unsplash.com，或开发工具勾选不校验） */
const headerAvatarFallback =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'

const discoverStore = useDiscoverStore()
const userStore = useUserStore()
const messagesStore = useMessagesStore()

/** 卡片大图：与 currentUser 同步；加载失败时降级本地图（避免域名未配时整块空白） */
const CARD_AVATAR_PLACEHOLDER = '/static/avatars/placeholder.png'
const cardAvatarSrc = ref('')

const currentUser = computed(() => discoverStore.currentUser)

watch(
  currentUser,
  (u) => {
    cardAvatarSrc.value = u?.avatar || CARD_AVATAR_PLACEHOLDER
  },
  { immediate: true },
)

function onCardAvatarError() {
  if (!cardAvatarSrc.value.includes('placeholder')) {
    cardAvatarSrc.value = CARD_AVATAR_PLACEHOLDER
  }
}
const dailyUsers = computed(() => discoverStore.dailyRecommendations)

/** 与 <transition :name> 对应：cx-heart 喜欢 | cx-pass 不喜欢 */
const cardTransitionName = ref<'cx-heart' | 'cx-pass'>('cx-heart')

// 触摸滑动相关
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const rotate = ref(0)
const isAnimating = ref(false)

const likeOverlayOpacity = computed(() =>
  Math.min(1, Math.max(0, translateX.value / 110)),
)
const passOverlayOpacity = computed(() =>
  Math.min(1, Math.max(0, -translateX.value / 110)),
)

const cardStyle = computed(() => {
  const absX = Math.abs(translateX.value)
  const scale = 1 + Math.min(absX / 2200, 0.035)
  const transition = isAnimating.value
    ? 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease'
    : 'none'
  return {
    transform: `translateX(${translateX.value}px) translateY(${translateY.value}px) rotate(${rotate.value}deg) scale(${scale})`,
    transition,
    willChange: isAnimating.value || absX > 8 ? 'transform' : 'auto',
  }
})

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

  // 实时更新结束位置，用于判断点击
  touchEndX.value = e.touches[0].clientX
  touchEndY.value = e.touches[0].clientY
}

function handleTouchEnd(e: TouchEvent) {
  // 记录触摸结束位置，用于判断是点击还是滑动
  touchEndX.value = e.changedTouches[0].clientX
  touchEndY.value = e.changedTouches[0].clientY

  const threshold = 110
  isAnimating.value = true

  if (translateX.value > threshold) {
    translateX.value = 520
    rotate.value = 28
    setTimeout(() => {
      commitLike()
      resetCard()
    }, 360)
  } else if (translateX.value < -threshold) {
    translateX.value = -520
    rotate.value = -28
    setTimeout(() => {
      commitPass()
      resetCard()
    }, 360)
  } else {
    translateX.value = 0
    translateY.value = 0
    rotate.value = 0
    setTimeout(() => {
      isAnimating.value = false
    }, 380)
  }
}

/** 点击卡片进入详情页（仅在没有发生滑动时触发） */
function handleCardTap() {
  // 计算滑动距离
  const moveX = Math.abs(touchEndX.value - touchStartX.value)
  const moveY = Math.abs(touchEndY.value - touchStartY.value)

  // 如果移动距离很小（小于10px），认为是点击而非滑动
  const TAP_THRESHOLD = 10
  if (moveX < TAP_THRESHOLD && moveY < TAP_THRESHOLD && currentUser.value) {
    navigateToUserDetail(currentUser.value.id)
  }
}

function resetCard() {
  translateX.value = 0
  translateY.value = 0
  rotate.value = 0
  touchStartX.value = 0
  touchStartY.value = 0
  touchEndX.value = 0
  touchEndY.value = 0
  setTimeout(() => {
    isAnimating.value = false
  }, 40)
}

/** 右滑 / 星标：极光弧抛 — 向右上旋出 + 饱和拉高；新卡自左下带回弹入 */
function commitLike() {
  if (!currentUser.value) return
  cardTransitionName.value = 'cx-heart'
  discoverStore.likeUser(currentUser.value.id)
}

/** 左滑 / X：裂隙坍缩 — 左下角铰链旋入暗部 + 灰阶；新卡自「亮缝」收缩浮现 */
function commitPass() {
  if (!currentUser.value) return
  cardTransitionName.value = 'cx-pass'
  discoverStore.dislikeUser(currentUser.value.id)
}

function handleGreeting() {
  if (currentUser.value) {
    const convId = messagesStore.createConversation(
      currentUser.value.id,
      currentUser.value.nickname,
      currentUser.value.avatar
    )
    uni.navigateTo({ url: `/pages/messages/chat?conversationId=${convId}` })
  }
}

function navigateToFilter() {
  uni.switchTab({ url: '/pages/filter/index' })
}

function navigateToMessages() {
  uni.switchTab({ url: '/pages/messages/index' })
}

function navigateToUserDetail(userId: string) {
  uni.navigateTo({ url: `/pages/user/detail?id=${userId}` })
}

function openReportFlow(source: string) {
  // 打开举报弹层
  console.log('Report from:', source)
}

/** 与筛选/消息/我的页一致：隐藏原生 TabBar，避免与自定义 TabBar 叠层（需 pages.json tabBar.custom 为 false） */
function hideNativeTabBar() {
  safeHideNativeTabBar()
}

onShow(() => {
  hideNativeTabBar()
  nextTick(hideNativeTabBar)
})

onMounted(() => {
  hideNativeTabBar()
  discoverStore.generateDailyRecommendations()
})
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>