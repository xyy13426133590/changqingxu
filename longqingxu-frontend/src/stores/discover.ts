import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserCard as ApiUserCard } from '@/services/api-user'
import {
  apiGetRecommendations,
  apiGetDailyRecommendations,
  apiUpdateFilters,
} from '@/services/api-user'
import {
  apiLikeUser,
  apiPassUser,
  apiSuperLikeUser,
  apiResetSwipeHistory,
} from '@/services/api-match'
import { resolveAvatar } from '@/utils/avatar'

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

/** 年收入筛选默认「10万-20万」（单选） */
const DEFAULT_INCOME: IncomeFilterOption = '10万-20万'

/** 持久化恢复：单选；兼容旧版多选数组取第一项合法值 */
function normalizeIncomeFilter(income: unknown): IncomeFilterOption {
  const valid = new Set<string>([...INCOME_FILTER_OPTIONS])
  if (typeof income === 'string' && valid.has(income)) {
    return income as IncomeFilterOption
  }
  if (Array.isArray(income)) {
    for (const x of income) {
      if (typeof x === 'string' && valid.has(x)) {
        return x as IncomeFilterOption
      }
    }
  }
  return DEFAULT_INCOME
}

// 筛选条件
export interface FilterCriteria {
  zodiacMatch: 'all' | 'sanhe' | 'liuhe' | 'both'
  ageMin: number
  ageMax: number
  distance: 'sameCity' | 'sameProvince' | 'all'
  education: EducationFilterOption
  /** 年收入（单选，文案与 INCOME_FILTER_OPTIONS 一致） */
  income: IncomeFilterOption
}

function mapApiCard(c: ApiUserCard): UserCard {
  const g = c.gender === 'male' ? 'male' : 'female'
  return {
    id: c.id,
    nickname: c.nickname,
    avatar: resolveAvatar(c.avatar, c.id),
    age: c.age ?? 0,
    gender: g,
    location: c.location || '',
    height: c.height,
    zodiac: c.zodiac || '',
    zodiacSign: c.zodiacSign || '',
    mbti: c.mbti || '',
    riyuan: c.riyuan || '',
    education: c.education || '',
    occupation: c.occupation || '',
    income: c.income || '',
    matchScore: c.matchScore ?? 0,
    matchReason: c.matchReason || '',
    matchTagline: c.matchTagline || '',
    isRealName: !!c.isRealName,
    isVip: !!c.isVip,
    bio: c.bio || '',
    photos: [],
  }
}

function repairFilters(f: FilterCriteria) {
  if (typeof f.ageMin !== 'number' || Number.isNaN(f.ageMin)) f.ageMin = 18
  if (typeof f.ageMax !== 'number' || Number.isNaN(f.ageMax)) f.ageMax = 35
  if (f.ageMax < f.ageMin) f.ageMax = f.ageMin
  f.education = normalizeEducationFilter(f.education)
  f.income = normalizeIncomeFilter(f.income)
  if (f.distance !== 'sameCity' && f.distance !== 'sameProvince' && f.distance !== 'all') {
    f.distance = 'sameCity'
  }
  if (f.zodiacMatch !== 'all' && f.zodiacMatch !== 'sanhe' && f.zodiacMatch !== 'liuhe' && f.zodiacMatch !== 'both') {
    f.zodiacMatch = 'all'
  }
}

function buildFilterPayload(f: FilterCriteria) {
  repairFilters(f)
  let zodiacMatch: string[] | undefined
  switch (f.zodiacMatch) {
    case 'sanhe':
      zodiacMatch = ['三合']
      break
    case 'liuhe':
      zodiacMatch = ['六合']
      break
    case 'both':
      zodiacMatch = ['三合', '六合']
      break
    default:
      zodiacMatch = undefined
  }
  let distance: number | undefined
  if (f.distance === 'sameCity') distance = 50
  else if (f.distance === 'sameProvince') distance = 200
  else distance = undefined
  return {
    ageRange: { min: f.ageMin, max: f.ageMax },
    education: [f.education],
    incomeRange:
      f.income != null ? { min: f.income, max: f.income } : undefined,
    zodiacMatch,
    distance,
  }
}

export const useDiscoverStore = defineStore('discover', () => {
  const users = ref<UserCard[]>([])
  
  const currentIndex = ref<number>(0)
  const filters = ref<FilterCriteria>({
    zodiacMatch: 'all',
    ageMin: 18,
    ageMax: 35,
    distance: 'sameCity',
    education: DEFAULT_EDUCATION,
    income: DEFAULT_INCOME,
  })
  
  const dailyRecommendations = ref<UserCard[]>([])

  const currentUser = computed(() => users.value[currentIndex.value])
  const hasMore = computed(() => currentIndex.value < users.value.length - 1)

  const loadError = ref<string | null>(null)
  /** 已滑完演示库，后端重新展示曾滑过的用户 */
  const recommendationsRecycled = ref(false)

  async function fetchRecommendations(): Promise<boolean> {
    try {
      const { users: list, recycled } = await apiGetRecommendations(1, 50)
      users.value = (list ?? []).map(mapApiCard)
      recommendationsRecycled.value = !!recycled
      loadError.value = null
      currentIndex.value = 0
      return users.value.length > 0
    } catch (e) {
      users.value = []
      loadError.value = e instanceof Error ? e.message : '推荐列表加载失败'
      currentIndex.value = 0
      return false
    }
  }

  async function fetchDailyRecommendations(): Promise<boolean> {
    try {
      const { users: list } = await apiGetDailyRecommendations()
      dailyRecommendations.value = (list ?? []).map(mapApiCard)
      return dailyRecommendations.value.length > 0
    } catch {
      dailyRecommendations.value = []
      return false
    }
  }

  /** 清空滑卡记录后重新拉取推荐 */
  async function resetAndReloadDiscover(): Promise<boolean> {
    try {
      await apiResetSwipeHistory()
    } catch {
      return false
    }
    recommendationsRecycled.value = false
    await loadDiscoverPage()
    return users.value.length > 0
  }

  /** 发现页统一拉取（主卡 + 每日推荐） */
  async function loadDiscoverPage(): Promise<void> {
    repairFilters(filters.value)
    await Promise.all([fetchRecommendations(), fetchDailyRecommendations()])
  }

  function nextUser() {
    if (hasMore.value) {
      currentIndex.value++
      return
    }
    void fetchRecommendations()
  }

  async function likeUser(userId: string) {
    try {
      await apiLikeUser(userId)
      nextUser()
    } catch {
      /* toast in api layer */
    }
  }

  async function dislikeUser(userId: string) {
    try {
      await apiPassUser(userId)
      nextUser()
    } catch {
      /* toast */
    }
  }

  async function superLikeUser(userId: string) {
    try {
      await apiSuperLikeUser(userId)
      nextUser()
    } catch {
      /* toast */
    }
  }

  function updateFilters(newFilters: Partial<FilterCriteria>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function setAgeRange(min: number, max: number) {
    filters.value.ageMin = min
    filters.value.ageMax = max
  }

  function setEducation(value: EducationFilterOption) {
    filters.value.education = value
  }

  function setIncomeFilter(value: string) {
    const valid = new Set<string>([...INCOME_FILTER_OPTIONS])
    if (valid.has(value)) {
      filters.value.income = value as IncomeFilterOption
    }
  }

  function resetFilters() {
    filters.value = {
      zodiacMatch: 'all',
      ageMin: 18,
      ageMax: 35,
      distance: 'sameCity',
      education: DEFAULT_EDUCATION,
      income: DEFAULT_INCOME,
    }
  }

  async function applyFilters() {
    try {
      await apiUpdateFilters(buildFilterPayload(filters.value))
    } catch {
      /* toast */
    }
    currentIndex.value = 0
    await fetchRecommendations()
  }

  /** @deprecated 使用 fetchDailyRecommendations */
  async function generateDailyRecommendations() {
    await fetchDailyRecommendations()
  }

  function reset() {
    currentIndex.value = 0
  }

  function clearDiscoverData() {
    users.value = []
    dailyRecommendations.value = []
    currentIndex.value = 0
    loadError.value = null
    recommendationsRecycled.value = false
  }

  function repairFiltersState() {
    repairFilters(filters.value)
  }

  return {
    users,
    currentIndex,
    currentUser,
    hasMore,
    filters,
    dailyRecommendations,
    loadError,
    recommendationsRecycled,
    resetAndReloadDiscover,
    fetchRecommendations,
    fetchDailyRecommendations,
    loadDiscoverPage,
    nextUser,
    likeUser,
    dislikeUser,
    superLikeUser,
    updateFilters,
    setAgeRange,
    setEducation,
    setIncomeFilter,
    resetFilters,
    applyFilters,
    generateDailyRecommendations,
    reset,
    clearDiscoverData,
    repairFiltersState,
  }
}, {
  persist: {
    key: 'discover-store',
    paths: ['filters'],
    afterRestore: ({ store }) => {
      repairFilters(store.filters as FilterCriteria)
    },
  },
})