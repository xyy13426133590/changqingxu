import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  apiLogin,
  apiSmsLogin,
  apiRegister,
  apiWechatLogin,
} from '@/services/api-auth'
import { apiGetMe, type UserProfile as ApiUserProfile } from '@/services/api-user'
import { clearToken, getToken } from '@/services/api'
import { resolveAvatar } from '@/utils/avatar'

export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  gender: 'male' | 'female' | ''
  birthday?: string
  age?: number
  height?: number
  weight?: number
  hometown: string
  location: string
  zodiac: string
  zodiacSign: string
  mbti: string
  riyuan: string
  education: string
  school?: string
  schoolTier?: '985' | '211' | null
  occupation: string
  jobLevel: string
  company?: string
  income: string
  bio: string
  hobbies: string[]
  isRealName: boolean
  isFaceVerified: boolean
  isVip: boolean
  vipExpiry?: string
  legalName?: string
  idCardMasked?: string
}

export interface VipPlan {
  id: string
  name: string
  duration: number
  price: number
  originalPrice: number
  features: string[]
  tag?: string
}

function mapApiUserToProfile(p: ApiUserProfile): Partial<UserProfile> {
  const gender: UserProfile['gender'] =
    p.gender === 'male' || p.gender === 'female' ? p.gender : ''
  let vipExpiry: string | undefined
  if (p.vipExpiry != null) {
    vipExpiry =
      typeof p.vipExpiry === 'string'
        ? p.vipExpiry
        : new Date(p.vipExpiry as unknown as Date).toISOString()
  }
  return {
    id: p.id,
    nickname: p.nickname,
    avatar: resolveAvatar(p.avatar, p.id),
    gender,
    birthday: p.birthday ?? undefined,
    hometown: p.hometown || '',
    location: p.location || '',
    age: p.age,
    height: p.height,
    weight: p.weight,
    zodiac: p.zodiac || '',
    zodiacSign: p.zodiacSign || '',
    mbti: p.mbti || '',
    riyuan: p.riyuan || '',
    education: p.education || '',
    school: p.school,
    schoolTier: p.schoolTier,
    occupation: p.occupation || '',
    jobLevel: p.jobLevel || '',
    company: p.company,
    bio: p.bio || '',
    hobbies: p.hobbies || [],
    isRealName: !!p.isRealName,
    isFaceVerified: !!p.isFaceVerified,
    isVip: !!p.isVip,
    vipExpiry,
  }
}

function maskIdCard(id: string): string {
  const s = id.trim()
  if (s.length < 8) return '****************'
  return `${s.slice(0, 4)}**********${s.slice(-4)}`
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const isLogin = ref<boolean>(false)
  const realNameDraft = ref<{ legalName: string; idCard: string } | null>(null)
  const profile = ref<Partial<UserProfile>>({})

  const dailyGreetings = ref<number>(3)
  const maxDailyGreetings = ref<number>(3)

  const remainingGreetings = computed(() => dailyGreetings.value)
  const canGreet = computed(() => dailyGreetings.value > 0 || !!profile.value.isVip)
  const vipStatus = computed(() => {
    if (!profile.value.isVip) return 'none'
    return profile.value.vipExpiry && new Date(profile.value.vipExpiry) > new Date()
      ? 'active'
      : 'expired'
  })

  function init() {
    const savedToken = uni.getStorageSync('token') as string
    if (savedToken) {
      token.value = savedToken
      isLogin.value = true
      void hydrateProfile()
    } else {
      token.value = ''
      isLogin.value = false
      profile.value = {}
    }
    resetDailyGreetings()
  }

  async function hydrateProfile(): Promise<boolean> {
    const t = getToken() || token.value || (uni.getStorageSync('token') as string)
    if (!t) return false
    try {
      const me = await apiGetMe()
      profile.value = { ...profile.value, ...mapApiUserToProfile(me) }
      isLogin.value = true
      token.value = t
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      // 仅鉴权失效时清登录态；网络抖动等不应把刚登录用户踢下线
      if (
        msg.includes('401') ||
        msg.includes('未授权') ||
        msg.includes('Unauthorized') ||
        msg.includes('登录已过期')
      ) {
        logout()
      }
      return false
    }
  }

  async function loginByPhone(phone: string, password: string) {
    await apiLogin({ phone, password })
    const me = await apiGetMe()
    const access = getToken()
    if (!access) throw new Error('登录态异常')
    setLogin(access, mapApiUserToProfile(me))
  }

  async function loginBySms(phone: string, code: string) {
    const auth = await apiSmsLogin({ phone, code })
    const access = getToken()
    if (!access) throw new Error('登录态异常')
    try {
      const me = await apiGetMe()
      setLogin(access, mapApiUserToProfile(me))
    } catch {
      setLogin(access, {
        id: auth.user.id,
        nickname: auth.user.nickname || `用户${phone.slice(-4)}`,
        avatar: resolveAvatar(auth.user.avatar, auth.user.id),
        gender: '',
        hometown: '',
        location: '',
        zodiac: '',
        zodiacSign: '',
        mbti: '',
        riyuan: '',
        education: '',
        occupation: '',
        jobLevel: '',
        income: '',
        bio: '',
        hobbies: [],
        isRealName: !!auth.user.isRealName,
        isFaceVerified: !!auth.user.isFaceVerified,
        isVip: !!auth.user.isVip,
      })
    }
  }

  async function loginByWeChat() {
    let code: string | undefined
    // #ifdef MP-WEIXIN
    const loginRes = await uni.login({ provider: 'weixin' })
    code = loginRes.code
    // #endif
    if (!code) {
      throw new Error('请在微信小程序中使用微信登录，或使用手机号登录')
    }
    await apiWechatLogin({ code })
    const me = await apiGetMe()
    const access = getToken()
    if (!access) throw new Error('登录态异常')
    setLogin(access, mapApiUserToProfile(me))
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
    await apiRegister({ phone, password, nickname })
    const me = await apiGetMe()
    const access = getToken()
    if (!access) throw new Error('登录态异常')
    setLogin(access, mapApiUserToProfile(me))
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
    clearToken()
    token.value = ''
    isLogin.value = false
    profile.value = {}
    realNameDraft.value = null
    useDiscoverStore().clearDiscoverData()
  }

  function updateProfile(data: Partial<UserProfile>) {
    profile.value = { ...profile.value, ...data }
  }

  function upgradeVip(_planId: string, expiryDate: string) {
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
    hydrateProfile,
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
