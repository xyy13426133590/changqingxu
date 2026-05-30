<template>
  <view class="page-container gradient-bg">
    <!-- 顶部导航（与微信小程序胶囊垂直对齐） -->
    <view :style="capsuleNavOuterStyle">
      <view class="header" :style="capsuleNavRowStyle">
        <view class="header-left">
          <view class="avatar-ripple-small">
            <image
              class="avatar-img"
              :src="headerAvatarSrc"
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
          <view v-if="!pageLoading && dailyUsers.length === 0" class="daily-empty">
            <text class="daily-empty-text">{{ dailyEmptyHint }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 用户卡片区域 -->
    <view class="card-container">
      <view v-if="pageLoading" class="empty-card glass">
        <text class="empty-title">加载中…</text>
      </view>
      <view v-else-if="!currentUser" class="empty-card glass">
        <text class="empty-title">暂无推荐</text>
        <text class="empty-desc">{{ emptyHint }}</text>
        <view class="empty-actions">
          <view
            v-if="userStore.isLogin"
            class="empty-btn primary"
            @click="resetDiscoverSwipes"
          >
            重新浏览
          </view>
          <view class="empty-btn" :class="{ primary: !userStore.isLogin }" @click="reloadDiscover">
            重新加载
          </view>
          <view v-if="!userStore.isLogin" class="empty-btn" @click="goLogin">去登录</view>
          <view v-else class="empty-btn" @click="navigateToFilter">调整筛选</view>
          <view
            v-if="userStore.isLogin"
            class="empty-btn seed-btn"
            :class="{ loading: seeding }"
            @click="seedDemoUsers"
          >
            {{ seeding ? '写入中…' : '初始化演示数据' }}
          </view>
        </view>
      </view>
      <view
        v-else
        class="user-card glass"
        :style="cardStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @tap="handleCardTap"
      >
        <!-- 小程序 transition 易导致卡片内容不渲染，改用 key 切换 -->
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
            <text>{{ currentUser.age }}岁 · {{ currentUser.location }} · {{ currentUser.height ?? '—' }}cm</text>
          </view>
          
          <!-- 标签区 -->
          <view class="tags-row">
            <view v-if="currentUser.zodiac" class="tag-yellow zodiac-glow">
              <text>{{ getZodiacEmoji(currentUser.zodiac) }} {{ currentUser.zodiac }}</text>
            </view>
            <view v-if="currentUser.zodiacSign" class="tag-blue">
              <text>{{ getZodiacSignEmoji(currentUser.zodiacSign) }} {{ currentUser.zodiacSign }}</text>
            </view>
            <view v-if="currentUser.riyuan" class="tag-amber">
              <text>{{ getRiyuanEmoji(currentUser.riyuan) }} {{ currentUser.riyuan }}</text>
            </view>
            <view v-if="currentUser.mbti" class="tag-purple tag-mbti">
              <text class="font-mono">{{ currentUser.mbti }}</text>
            </view>
            <view v-if="currentUser.education" class="tag-purple-light">
              <text>📚 {{ currentUser.education }}</text>
            </view>
            <view v-if="currentUser.occupation" class="tag-green">
              <text>💼 {{ currentUser.occupation }}</text>
            </view>
            <view v-if="currentUser.income" class="tag-orange">
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
      </view>

      <!-- 滑动提示（仅有推荐卡时显示） -->
      <view v-if="currentUser && !pageLoading" class="swipe-hints">
        <text class="hint-left">← 不喜欢</text>
        <text class="hint-right">喜欢 →</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="currentUser && !pageLoading" class="action-bar">
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
import { getToken, resolveAccessToken } from '@/services/api'
import { callCloud, USE_CLOUD, CloudUnauthorizedError } from '@/services/cloud'
import { isMpWeixinLocalhostApi, mpWeixinApiHint } from '@/utils/dev-api'
import { resolveAvatar, DEMO_AVATARS } from '@/utils/avatar'
import { safeHideNativeTabBar } from '@/utils/tabbar'
import { getCapsuleNavOuterStyle, getCapsuleNavRowStyle } from '@/utils/safe-area'

const capsuleNavOuterStyle = computed(() => getCapsuleNavOuterStyle())
const capsuleNavRowStyle = computed(() => getCapsuleNavRowStyle())

const discoverStore = useDiscoverStore()
const userStore = useUserStore()
const messagesStore = useMessagesStore()

const headerAvatarSrc = computed(() =>
  resolveAvatar(userStore.profile.avatar, userStore.profile.id),
)

/** 卡片大图：与 currentUser 同步；加载失败时降级本地图 */
const cardAvatarSrc = ref<string>(DEMO_AVATARS[0])

const currentUser = computed(() => discoverStore.currentUser)

watch(
  currentUser,
  (u) => {
    cardAvatarSrc.value = u?.avatar || resolveAvatar('', u?.id)
  },
  { immediate: true },
)

function onCardAvatarError() {
  const u = currentUser.value
  cardAvatarSrc.value = resolveAvatar('', u?.id)
}

function onDailyAvatarError(userId: string) {
  const u = dailyUsers.value.find((x) => x.id === userId)
  if (u) {
    u.avatar = resolveAvatar('', userId)
  }
}
const dailyUsers = computed(() => discoverStore.dailyRecommendations)
const pageLoading = ref(false)
const seeding = ref(false)

const dailyEmptyHint = computed(() => {
  if (!getToken()) return '登录后查看每日推荐'
  if (discoverStore.loadError) return '加载失败，请点重新加载'
  return '暂无推荐，可点下方重新浏览'
})

const emptyHint = computed(() => {
  if (isMpWeixinLocalhostApi()) {
    return mpWeixinApiHint()
  }
  if (!userStore.isLogin && !getToken()) {
    return '登录后可查看推荐用户；本地可先执行后端 seed:dev 写入演示账号。'
  }
  if (discoverStore.loadError) {
    // 隐藏技术性报错，显示友好提示
    return '推荐列表暂时无法加载，请点「重新加载」重试。'
  }
  if (discoverStore.recommendationsRecycled) {
    return '本地演示账号较少，你已滑完一轮；系统已重新展示推荐。继续滑卡会再次看完，可点「重新浏览」清空记录。'
  }
  if (userStore.isLogin) {
    return '库里暂无可推荐用户。可点「初始化演示数据」写入演示账号，或放宽筛选条件。'
  }
  return '库里暂无其他用户。请先登录，或运行 pnpm run seed:dev 写入演示数据。'
})

async function reloadDiscover() {
  if (isMpWeixinLocalhostApi()) {
    uni.showModal({
      title: '接口地址',
      content: mpWeixinApiHint(),
      showCancel: false,
    })
    return
  }
  await loadDiscoverIfAuthed()
  if (discoverStore.loadError?.includes('请先登录')) {
    uni.showModal({
      title: '登录已失效',
      content: '登录凭证未同步或已过期，请重新登录后再查看推荐。',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) goLogin()
      },
    })
    return
  }
  if (hasAuthSession() && !discoverStore.currentUser) {
    if (USE_CLOUD) {
      try {
        const diag = await callCloud<{
          totalActiveUsers: number
          recommendableForYou: number
          yourUserFound: boolean
          userId: string | null
          collection: string
          sampleNicknames: string[]
        }>('dev-diagnoseDiscover')
        let content = ''
        if (!resolveAccessToken()) {
          content = '未检测到登录凭证，请重新登录。'
        } else if (!diag.userId) {
          content = '登录凭证无效，云函数无法识别当前用户，请退出后重新登录。'
        } else if (!diag.yourUserFound) {
          content = '当前登录账号不在 dev_users 中，请重新注册/登录一次。'
        } else if (diag.recommendableForYou > 0) {
          content = `${diag.collection} 中有 ${diag.recommendableForYou} 人可推荐（如：${diag.sampleNicknames.join('、')}），请点「重新加载」或重新部署 user-getRecommendations。`
        } else if (diag.totalActiveUsers <= 1) {
          content = `${diag.collection} 里只有你自己，请先点「初始化演示数据」。`
        } else {
          content = `共 ${diag.totalActiveUsers} 人，但可推荐为 0。请点「重新浏览」或放宽筛选。`
        }
        uni.showModal({ title: '仍无推荐', content, showCancel: false })
        return
      } catch (e) {
        if (e instanceof CloudUnauthorizedError) {
          uni.showModal({
            title: '请先登录',
            content: '当前未携带有效登录凭证，请重新登录。',
            confirmText: '去登录',
            success: (res) => {
              if (res.confirm) goLogin()
            },
          })
          return
        }
      }
    }
    uni.showToast({ title: '仍无推荐，请检查后端与数据库', icon: 'none' })
  }
}

async function seedDemoUsers() {
  if (!USE_CLOUD) {
    uni.showToast({ title: '仅支持云函数模式', icon: 'none' })
    return
  }
  seeding.value = true
  try {
    const res = await callCloud<{
      added: string[]
      skipped: string[]
      failed: Array<{ nickname: string; error: string }>
      totalInCollection: number
    }>('dev-seedUsers', {}, { skipAuth: true })
    const added = res.added?.length ?? 0
    const skipped = res.skipped?.length ?? 0
    const total = res.totalInCollection ?? 0
    uni.showToast({
      title: `新增 ${added}，跳过 ${skipped}，库中共 ${total} 人`,
      icon: 'none',
      duration: 3500,
    })
    await discoverStore.loadDiscoverPage()
    if (!discoverStore.currentUser) {
      uni.showToast({ title: '数据已写入，请点「重新加载」', icon: 'none' })
    }
  } catch (e: any) {
    uni.showToast({
      title: e?.message?.includes('not exist') || e?.message?.includes('找不到')
        ? '请先在开发者工具部署 dev-seedUsers 云函数'
        : (e?.message || '写入失败，请先部署云函数'),
      icon: 'none',
      duration: 3500,
    })
  } finally {
    seeding.value = false
  }
}

async function resetDiscoverSwipes() {
  if (!getToken()) {
    goLogin()
    return
  }
  pageLoading.value = true
  try {
    const ok = await discoverStore.resetAndReloadDiscover()
    if (ok) {
      uni.showToast({ title: '已恢复推荐', icon: 'success' })
    } else {
      uni.showToast({ title: '仍无推荐，请检查后端或 seed 数据', icon: 'none' })
    }
  } finally {
    pageLoading.value = false
  }
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}

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
  discoverStore.likeUser(currentUser.value.id)
}

/** 左滑 / X：裂隙坍缩 — 左下角铰链旋入暗部 + 灰阶；新卡自「亮缝」收缩浮现 */
function commitPass() {
  if (!currentUser.value) return
  discoverStore.dislikeUser(currentUser.value.id)
}

async function handleGreeting() {
  const peer = currentUser.value
  if (!peer?.id) {
    uni.showToast({ title: '用户信息异常，请刷新推荐', icon: 'none' })
    return
  }
  if (!userStore.isLogin) {
    uni.navigateTo({ url: '/pages/auth/welcome' })
    return
  }
  uni.showLoading({ mask: true, title: '准备聊天…' })
  try {
    const convId = await messagesStore.createConversation(
      peer.id,
      peer.nickname,
      peer.avatar,
    )
    if (!convId) {
      uni.showToast({ title: '创建会话失败', icon: 'none' })
      return
    }
    await messagesStore.setCurrentConversation(convId)
    await messagesStore.loadMessages(convId)
    uni.navigateTo({ url: `/pages/messages/chat?conversationId=${convId}` })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '创建会话失败'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    uni.hideLoading()
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

function hasAuthSession(): boolean {
  return !!resolveAccessToken()
}

async function loadDiscoverIfAuthed() {
  if (!hasAuthSession()) {
    discoverStore.clearDiscoverData()
    return
  }
  pageLoading.value = true
  try {
    discoverStore.repairFiltersState()
    await discoverStore.loadDiscoverPage()
    if (!discoverStore.currentUser && discoverStore.users.length === 0) {
      await discoverStore.resetAndReloadDiscover()
    }
    void userStore.hydrateProfile()
  } finally {
    pageLoading.value = false
  }
}

watch(
  () => userStore.isLogin,
  (loggedIn) => {
    if (loggedIn && hasAuthSession()) {
      void loadDiscoverIfAuthed()
    }
  },
)

onShow(async () => {
  hideNativeTabBar()
  nextTick(hideNativeTabBar)
  if (isMpWeixinLocalhostApi()) {
    uni.showToast({ title: '请配置局域网 API 地址', icon: 'none', duration: 3000 })
  }
  await loadDiscoverIfAuthed()
})

onMounted(() => {
  hideNativeTabBar()
  void loadDiscoverIfAuthed()
})
</script>

<style scoped lang="scss">
@import '@/styles/vars.scss';
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.empty-card {
  margin: 24rpx;
  padding: 48rpx 32rpx;
  border-radius: 24rpx;
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #f0e8ff;
  margin-bottom: 16rpx;
}

.empty-desc {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 32rpx;
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: center;
}

.empty-btn {
  padding: 20rpx 48rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  color: rgba(255, 220, 240, 0.8);
  background: rgba(255, 200, 220, 0.1);
  border: 1rpx solid rgba(255, 200, 220, 0.18);
}

.empty-btn.primary {
  color: #fff;
  background: linear-gradient(135deg, #c084fc, #f472b6);
  border: none;
}

.empty-btn.seed-btn {
  font-size: 24rpx;
  color: $text-secondary;
  background: rgba(255, 200, 220, 0.06);
  border: 1rpx dashed rgba(255, 200, 220, 0.2);
  padding: 14rpx 32rpx;
}

.empty-btn.seed-btn.loading {
  opacity: 0.5;
}

.daily-empty {
  display: inline-flex;
  align-items: center;
  padding: 16rpx 24rpx;
  min-width: 280rpx;
}

.daily-empty-text {
  font-size: 24rpx;
  color: $text-secondary;
}

/* 小程序：保证卡片内容区有高度，避免只显示空玻璃框 */
.user-card-body {
  min-height: 520rpx;
  display: flex;
  flex-direction: column;
}

.photo-area {
  min-height: 360rpx;
}
</style>