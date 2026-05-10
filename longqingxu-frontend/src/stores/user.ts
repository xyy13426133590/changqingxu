import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  authLogin,
  authRegister,
  authLoginBySms,
  authLoginWechatMock,
  type MockAuthUser,
} from '@/services/auth'
import { avatarUrl } from '@/utils/avatar'

// 用户资料类型
export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  gender: 'male' | 'female' | ''
  birthday: string
  age?: number
  height?: number
  weight?: number
  hometown: string
  location: string
  
  // 生辰信息
  zodiac: string
  zodiacSign: string
  mbti: string
  riyuan: string
  
  // 教育职业
  education: string
  school?: string
  schoolTier?: '985' | '211' | null
  occupation: string
  jobLevel: string
  company?: string
  income: string
  
  // 个人介绍
  bio: string
  hobbies: string[]
  
  // 认证状态
  isRealName: boolean
  isFaceVerified: boolean
  isVip: boolean
  vipExpiry?: string
  /** 实名（与身份证一致），脱敏展示用 */
  legalName?: string
  idCardMasked?: string
}

// VIP 套餐类型
export interface VipPlan {
  id: string
  name: string
  duration: number
  price: number
  originalPrice: number
  features: string[]
  tag?: string
}

const MOCK_DEFAULT_AVATAR = avatarUrl(
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
)

/** 将本地 mock 登录用户转为资料（缺省字段用于演示 UI） */
function profileFromMockUser(user: MockAuthUser): Partial<UserProfile> {
  return {
    id: user.id,
    nickname: user.nickname,
    avatar: MOCK_DEFAULT_AVATAR,
    gender: 'female',
    birthday: '',
    age: 26,
    hometown: '北京',
    location: '北京朝阳区',
    zodiac: '兔',
    zodiacSign: '天秤座',
    mbti: 'INFP',
    riyuan: '甲木',
    education: '本科',
    occupation: '产品经理',
    jobLevel: '中级',
    income: '10万-20万',
    bio: '认真生活，期待遇见同频的你～',
    hobbies: [],
    isRealName: false,
    isFaceVerified: false,
    isVip: false,
  }
}

function maskIdCard(id: string): string {
  const s = id.trim()
  if (s.length < 8) return '****************'
  return `${s.slice(0, 4)}**********${s.slice(-4)}`
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>('')
  const isLogin = ref<boolean>(false)
  /** 实名认证页暂存，人脸识别成功后写入 profile 并清空（不持久化） */
  const realNameDraft = ref<{ legalName: string; idCard: string } | null>(null)
  const profile = ref<Partial<UserProfile>>({
    nickname: '小雨',
    avatar: avatarUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'),
    zodiac: '兔',
    zodiacSign: '天秤座',
    mbti: 'INFP',
    riyuan: '甲木',
    age: 26,
    location: '北京朝阳区',
    height: 162,
    education: '本科',
    occupation: '产品经理',
    income: '20万-30万',
    isRealName: true,
    isVip: true,
  })
  
  const dailyGreetings = ref<number>(3)
  const maxDailyGreetings = ref<number>(3)
  
  // Getters
  const remainingGreetings = computed(() => dailyGreetings.value)
  const canGreet = computed(() => dailyGreetings.value > 0 || profile.value.isVip)
  const vipStatus = computed(() => {
    if (!profile.value.isVip) return 'none'
    return profile.value.vipExpiry && new Date(profile.value.vipExpiry) > new Date() ? 'active' : 'expired'
  })
  
  // Actions
  function init() {
    const savedToken = uni.getStorageSync('token') as string
    if (savedToken) {
      token.value = savedToken
      isLogin.value = true
    } else {
      token.value = ''
      isLogin.value = false
      profile.value = {}
    }

    resetDailyGreetings()
  }

  async function loginByPhone(phone: string, password: string) {
    const { token: t, user } = await authLogin({ phone, password })
    setLogin(t, profileFromMockUser(user))
  }

  async function loginBySms(phone: string, code: string) {
    const { token: t, user } = await authLoginBySms(phone, code)
    setLogin(t, profileFromMockUser(user))
  }

  async function loginByWeChat() {
    const { token: t, user } = await authLoginWechatMock()
    setLogin(t, profileFromMockUser(user))
  }

  function setRealNameDraft(payload: { legalName: string; idCard: string }) {
    realNameDraft.value = payload
  }

  function clearRealNameDraft() {
    realNameDraft.value = null
  }

  function hasRealNameDraft(): boolean {
    return !!realNameDraft.value
  }

  /** 人脸识别完成：若有实名草稿则一并标记实名 */
  function applyFaceVerificationSuccess() {
    const d = realNameDraft.value
    if (d) {
      profile.value = {
        ...profile.value,
        legalName: d.legalName,
        idCardMasked: maskIdCard(d.idCard),
        isRealName: true,
        isFaceVerified: true,
      }
      realNameDraft.value = null
    } else {
      profile.value = { ...profile.value, isFaceVerified: true }
    }
  }

  async function registerByPhone(phone: string, password: string, nickname: string) {
    const { token: t, user } = await authRegister({ phone, password, nickname })
    setLogin(t, profileFromMockUser(user))
  }
  
  function resetDailyGreetings() {
    const lastReset = uni.getStorageSync('greetingLastReset')
    const today = new Date().toDateString()
    
    if (lastReset !== today) {
      dailyGreetings.value = maxDailyGreetings.value
      uni.setStorageSync('greetingLastReset', today)
    }
  }
  
  function useGreeting() {
    if (profile.value.isVip) return true
    if (dailyGreetings.value > 0) {
      dailyGreetings.value--
      return true
    }
    return false
  }
  
  function setLogin(userToken: string, userProfile: Partial<UserProfile>) {
    token.value = userToken
    profile.value = { ...userProfile }
    isLogin.value = true
    uni.setStorageSync('token', userToken)
  }
  
  function logout() {
    token.value = ''
    isLogin.value = false
    profile.value = {}
    realNameDraft.value = null
    uni.removeStorageSync('token')
  }
  
  function updateProfile(data: Partial<UserProfile>) {
    profile.value = { ...profile.value, ...data }
  }
  
  function upgradeVip(planId: string, expiryDate: string) {
    profile.value.isVip = true
    profile.value.vipExpiry = expiryDate
  }
  
  return {
    token,
    isLogin,
    profile,
    dailyGreetings,
    remainingGreetings,
    canGreet,
    vipStatus,
    init,
    resetDailyGreetings,
    useGreeting,
    setLogin,
    loginByPhone,
    loginBySms,
    loginByWeChat,
    setRealNameDraft,
    clearRealNameDraft,
    hasRealNameDraft,
    applyFaceVerificationSuccess,
    registerByPhone,
    logout,
    updateProfile,
    upgradeVip,
  }
}, {
  persist: {
    key: 'user-store',
    paths: ['token', 'profile', 'dailyGreetings'],
  },
})