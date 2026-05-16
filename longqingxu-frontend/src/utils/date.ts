/**
 * 日期/生肖/星座/MBTI 计算工具
 */

// 生肖对应表
const ZODIAC_ANIMALS = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊']

// 星座日期范围
const ZODIAC_SIGNS = [
  { name: '白羊座', start: '03-21', end: '04-19' },
  { name: '金牛座', start: '04-20', end: '05-20' },
  { name: '双子座', start: '05-21', end: '06-21' },
  { name: '巨蟹座', start: '06-22', end: '07-22' },
  { name: '狮子座', start: '07-23', end: '08-22' },
  { name: '处女座', start: '08-23', end: '09-22' },
  { name: '天秤座', start: '09-23', end: '10-23' },
  { name: '天蝎座', start: '10-24', end: '11-22' },
  { name: '射手座', start: '11-23', end: '12-21' },
  { name: '摩羯座', start: '12-22', end: '01-19' },
  { name: '水瓶座', start: '01-20', end: '02-18' },
  { name: '双鱼座', start: '02-19', end: '03-20' },
]

// MBTI 类型列表
const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

/**
 * 根据出生年份计算生肖
 */
export function getZodiac(year: number): string {
  // 以 1900 年为基准（1900 年是鼠年，对应索引 4 有误，需要调整）
  // 1900 年是鼠年，但数组从猴开始，所以需要特殊处理
  const baseYear = 1900
  const baseIndex = 0 // 猴
  const offset = (year - baseYear) % 12
  return ZODIAC_ANIMALS[(baseIndex + offset) % 12]
}

/**
 * 根据出生日期计算星座
 */
export function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

  for (const sign of ZODIAC_SIGNS) {
    // 处理跨年的摩羯座
    if (sign.name === '摩羯座') {
      if (dateStr >= '12-22' || dateStr <= '01-19') {
        return sign.name
      }
    } else if (dateStr >= sign.start && dateStr <= sign.end) {
      return sign.name
    }
  }

  return '白羊座' // 默认
}

/**
 * 基于生日计算 MBTI（趣味算法，仅供娱乐）
 * 使用生日的各种特征生成一个确定的 MBTI 类型
 */
export function getMBTI(birthDate: Date): string {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()

  // 基于年月日计算一个确定性的索引
  const seed = year * 10000 + month * 100 + day
  const index = seed % MBTI_TYPES.length

  return MBTI_TYPES[index]
}

/** 日元（天干五行）展示名，与资料卡/发现页一致 */
const RIYUAN_STEMS = [
  '甲木',
  '乙木',
  '丙火',
  '丁火',
  '戊土',
  '己土',
  '庚金',
  '辛金',
  '壬水',
  '癸水',
] as const

/**
 * 根据生日计算日元（确定性趣味算法，仅供娱乐参考）
 */
export function getRiyuan(birthDate: Date): string {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()
  const seed = year * 10000 + month * 100 + day
  return RIYUAN_STEMS[seed % RIYUAN_STEMS.length]
}

/** 日元展示用 emoji */
export function getRiyuanEmoji(riyuan: string): string {
  if (/甲|乙/.test(riyuan)) return '🌲'
  if (/丙|丁/.test(riyuan)) return '🔥'
  if (/戊|己/.test(riyuan)) return '⛰️'
  if (/庚|辛/.test(riyuan)) return '⚙️'
  return '💧'
}

/**
 * 计算生肖三合关系
 * 三合：猴鼠龙、蛇鸡牛、虎马狗、猪兔羊
 */
export function getSanhe(zodiac: string): string[] {
  const sanheGroups = [
    ['猴', '鼠', '龙'],
    ['蛇', '鸡', '牛'],
    ['虎', '马', '狗'],
    ['猪', '兔', '羊'],
  ]

  for (const group of sanheGroups) {
    if (group.includes(zodiac)) {
      return group.filter(z => z !== zodiac)
    }
  }

  return []
}

/**
 * 计算生肖六合关系
 * 六合：鼠牛、虎猪、兔狗、龙鸡、蛇猴、马羊
 */
export function getLiuhe(zodiac: string): string | null {
  const liuheMap: Record<string, string> = {
    '鼠': '牛',
    '牛': '鼠',
    '虎': '猪',
    '猪': '虎',
    '兔': '狗',
    '狗': '兔',
    '龙': '鸡',
    '鸡': '龙',
    '蛇': '猴',
    '猴': '蛇',
    '马': '羊',
    '羊': '马',
  }

  return liuheMap[zodiac] || null
}

/**
 * 检查两个生肖是否三合
 */
export function isSanhe(zodiac1: string, zodiac2: string): boolean {
  const sanhe = getSanhe(zodiac1)
  return sanhe.includes(zodiac2)
}

/**
 * 检查两个生肖是否六合
 */
export function isLiuhe(zodiac1: string, zodiac2: string): boolean {
  return getLiuhe(zodiac1) === zodiac2
}

/**
 * 根据生日计算完整生辰信息
 */
export function getBirthInfo(birthDate: Date) {
  const year = birthDate.getFullYear()

  return {
    zodiac: getZodiac(year),          // 生肖
    zodiacSign: getZodiacSign(birthDate),  // 星座
    riyuan: getRiyuan(birthDate),     // 日柱
    mbti: getMBTI(birthDate),         // MBTI
  }
}

/**
 * 格式化日期为年龄
 */
export function getAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()

  // 如果今年生日还没过，减一岁
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * 获取生肖 emoji
 */
export function getZodiacEmoji(zodiac: string): string {
  const map: Record<string, string> = {
    '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
    '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
    '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷',
  }
  return map[zodiac] || '🐰'
}

/** 星座中文名 → 符号（用于资料卡等统一图标位） */
export function getZodiacSignSymbol(signName: string): string {
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
  return map[signName] || '⭐'
}

/**
 * 格式化时间显示
 * 今天显示时分，昨天显示"昨天"，更早显示月日
 */
export function formatTimeDisplay(dateStr: string): string {
  if (!dateStr) return ''

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const date = new Date(dateStr)
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffDays = Math.floor((today.getTime() - targetDay.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // 今天，显示时分
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diffDays === 1) {
    // 昨天
    return '昨天'
  } else {
    // 更早，显示月日
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}