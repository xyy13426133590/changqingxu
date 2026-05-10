import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { avatarUrl } from '@/utils/avatar'

// 用户卡片类型
export interface UserCard {
  id: string
  nickname: string
  avatar: string
  age: number
  gender: 'male' | 'female'
  location: string
  height?: number
  
  // 标签
  zodiac: string
  zodiacSign: string
  mbti: string
  riyuan: string
  education: string
  occupation: string
  income: string
  
  // 匹配度
  matchScore: number
  matchReason: string
  /** 匹配徽章第二行文案（原型：志趣相投） */
  matchTagline: string
  
  // 认证状态
  isRealName: boolean
  isVip: boolean
  
  // 简介
  bio: string
  photos: string[]
}

/** 筛选学历（单选，与筛选页选项文案一致） */
export type EducationFilterOption = '大专及以下' | '本科' | '硕士及以上'

const EDUCATION_FILTER_VALUES: readonly EducationFilterOption[] = [
  '大专及以下',
  '本科',
  '硕士及以上',
]

const DEFAULT_EDUCATION: EducationFilterOption = '本科'

/** 持久化或旧版多选数组迁移为单一学历，非法则默认本科 */
function normalizeEducationFilter(education: unknown): EducationFilterOption {
  const valid = new Set<string>(EDUCATION_FILTER_VALUES)
  if (typeof education === 'string' && valid.has(education)) {
    return education as EducationFilterOption
  }
  if (Array.isArray(education)) {
    for (const item of education) {
      if (typeof item === 'string' && valid.has(item)) {
        return item as EducationFilterOption
      }
    }
  }
  return DEFAULT_EDUCATION
}

/** 与筛选页「年收入」标签文案一致，用于校验与默认项 */
export const INCOME_FILTER_OPTIONS = [
  '5万及以下',
  '5万-10万',
  '10万-20万',
  '20万-30万',
  '30万-50万',
  '50万以上',
] as const

export type IncomeFilterOption = (typeof INCOME_FILTER_OPTIONS)[number]

/** 默认仅选中「10万-20万」 */
const DEFAULT_INCOME_SELECTION: string[] = ['10万-20万']

/** 持久化恢复：过滤非法项；若为空则回到默认「10万-20万」 */
function normalizeIncomeFilter(income: unknown): string[] {
  const valid = new Set<string>([...INCOME_FILTER_OPTIONS])
  if (!Array.isArray(income)) {
    return [...DEFAULT_INCOME_SELECTION]
  }
  const picked = income.filter((x): x is string => typeof x === 'string' && valid.has(x))
  return picked.length > 0 ? picked : [...DEFAULT_INCOME_SELECTION]
}

// 筛选条件
export interface FilterCriteria {
  zodiacMatch: 'all' | 'sanhe' | 'liuhe' | 'both'
  ageMin: number
  ageMax: number
  distance: 'sameCity' | 'sameProvince' | 'all'
  education: EducationFilterOption
  income: string[]
}

function makeUser(p: Partial<UserCard> & Pick<UserCard, 'id' | 'nickname' | 'avatar'>): UserCard {
  return {
    age: 26,
    gender: 'female',
    location: '北京',
    height: 165,
    zodiac: '兔',
    zodiacSign: '天秤座',
    mbti: 'INFP',
    riyuan: '甲木',
    education: '本科',
    occupation: '产品经理',
    income: '20万-30万',
    matchScore: 88,
    matchReason: '生肖三合',
    matchTagline: '志趣相投',
    isRealName: true,
    isVip: false,
    bio: '认真生活，期待遇见同频的你～',
    photos: [],
    ...p,
  }
}

export const useDiscoverStore = defineStore('discover', () => {
  // State：不少于 10 位，供每日推荐横滑展示
  const users = ref<UserCard[]>([
    makeUser({
      id: 'u1',
      nickname: '林溪',
      avatar: avatarUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop'),
      location: '北京朝阳区',
      height: 162,
      zodiac: '兔',
      zodiacSign: '天秤座',
      mbti: 'INFP',
      riyuan: '甲木',
      matchScore: 92,
      matchReason: '生肖三合',
      matchTagline: '志趣相投',
      isVip: true,
      bio: '喜欢旅行、摄影、烘焙，期待遇见有趣的你～',
    }),
    makeUser({
      id: 'u2',
      nickname: '苏晴',
      avatar: avatarUrl('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop'),
      location: '北京海淀区',
      height: 165,
      zodiac: '龙',
      zodiacSign: '天蝎座',
      mbti: 'ENFJ',
      riyuan: '丙火',
      education: '硕士及以上',
      occupation: '金融分析师',
      income: '30万-50万',
      matchScore: 85,
      matchReason: '兴趣相投',
      matchTagline: '性格互补',
    }),
    makeUser({
      id: 'u3',
      nickname: '安然',
      avatar: avatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop'),
      zodiac: '蛇',
      zodiacSign: '处女座',
      mbti: 'ISFJ',
      riyuan: '乙木',
      occupation: '设计师',
      matchScore: 90,
    }),
    makeUser({
      id: 'u4',
      nickname: '若瑶',
      avatar: avatarUrl('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop'),
      zodiac: '马',
      zodiacSign: '射手座',
      mbti: 'ESFP',
      riyuan: '丁火',
      occupation: '市场运营',
      matchScore: 82,
      matchReason: '六合',
      matchTagline: '缘分合拍',
    }),
    makeUser({
      id: 'u5',
      nickname: '清越',
      avatar: avatarUrl('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop'),
      zodiac: '羊',
      zodiacSign: '双鱼座',
      mbti: 'INFJ',
      riyuan: '戊土',
      occupation: '教师',
      matchScore: 87,
    }),
    makeUser({
      id: 'u6',
      nickname: '知夏',
      avatar: avatarUrl('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop'),
      zodiac: '猴',
      zodiacSign: '双子座',
      mbti: 'ENTP',
      riyuan: '庚金',
      occupation: '法务',
      matchScore: 80,
      isVip: true,
    }),
    makeUser({
      id: 'u7',
      nickname: '晚星',
      avatar: avatarUrl('https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=500&fit=crop'),
      zodiac: '鸡',
      zodiacSign: '狮子座',
      mbti: 'ESTJ',
      riyuan: '辛金',
      occupation: '咨询顾问',
      matchScore: 84,
    }),
    makeUser({
      id: 'u8',
      nickname: '书言',
      avatar: avatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'),
      gender: 'male',
      zodiac: '狗',
      zodiacSign: '水瓶座',
      mbti: 'INTP',
      riyuan: '壬水',
      occupation: '研发工程师',
      matchScore: 79,
    }),
    makeUser({
      id: 'u9',
      nickname: '南乔',
      avatar: avatarUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop'),
      zodiac: '猪',
      zodiacSign: '巨蟹座',
      mbti: 'ISFP',
      riyuan: '癸水',
      occupation: '医护',
      matchScore: 91,
    }),
    makeUser({
      id: 'u10',
      nickname: '时宜',
      avatar: avatarUrl('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'),
      zodiac: '鼠',
      zodiacSign: '摩羯座',
      mbti: 'ISTJ',
      riyuan: '甲木',
      occupation: '公务员',
      matchScore: 86,
    }),
  ])
  
  const currentIndex = ref<number>(0)
  const filters = ref<FilterCriteria>({
    zodiacMatch: 'all',
    ageMin: 18,
    ageMax: 35,
    distance: 'sameCity',
    education: DEFAULT_EDUCATION,
    income: [...DEFAULT_INCOME_SELECTION],
  })
  
  const dailyRecommendations = ref<UserCard[]>([])
  
  // Getters
  const currentUser = computed(() => users.value[currentIndex.value])
  const hasMore = computed(() => currentIndex.value < users.value.length - 1)
  
  // Actions
  function nextUser() {
    if (hasMore.value) {
      currentIndex.value++
    }
  }
  
  function likeUser(userId: string) {
    // TODO: 发送喜欢请求
    console.log('Like user:', userId)
    nextUser()
  }
  
  function dislikeUser(userId: string) {
    // TODO: 发送不喜欢请求
    console.log('Dislike user:', userId)
    nextUser()
  }
  
  function superLikeUser(userId: string) {
    // TODO: 发送超级喜欢请求
    console.log('Super like user:', userId)
    nextUser()
  }
  
  function updateFilters(newFilters: Partial<FilterCriteria>) {
    filters.value = { ...filters.value, ...newFilters }
    // TODO: 重新获取推荐列表
  }

  function setAgeRange(min: number, max: number) {
    filters.value.ageMin = min
    filters.value.ageMax = max
  }

  function setEducation(value: EducationFilterOption) {
    filters.value.education = value
  }

  function toggleIncome(value: string) {
    const list = filters.value.income
    const index = list.indexOf(value)
    if (index > -1) {
      list.splice(index, 1)
      if (list.length === 0) {
        filters.value.income = [...DEFAULT_INCOME_SELECTION]
      }
    } else {
      list.push(value)
    }
  }

  function resetFilters() {
    filters.value = {
      zodiacMatch: 'all',
      ageMin: 18,
      ageMax: 35,
      distance: 'sameCity',
      education: DEFAULT_EDUCATION,
      income: ['10万-20万'],
    }
  }

  function applyFilters() {
    // TODO: 根据筛选条件重新获取推荐列表
    currentIndex.value = 0
    console.log('Applying filters:', filters.value)
  }

  function generateDailyRecommendations() {
    const pool = [...users.value]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    dailyRecommendations.value = pool.slice(0, 10)
  }
  
  function reset() {
    currentIndex.value = 0
  }
  
  return {
    users,
    currentIndex,
    currentUser,
    hasMore,
    filters,
    dailyRecommendations,
    nextUser,
    likeUser,
    dislikeUser,
    superLikeUser,
    updateFilters,
    setAgeRange,
    setEducation,
    toggleIncome,
    resetFilters,
    applyFilters,
    generateDailyRecommendations,
    reset,
  }
}, {
  persist: {
    key: 'discover-store',
    paths: ['filters'],
    afterRestore: ({ store }) => {
      const f = store.filters as FilterCriteria
      f.education = normalizeEducationFilter(f.education)
      f.income = normalizeIncomeFilter(f.income)
    },
  },
})