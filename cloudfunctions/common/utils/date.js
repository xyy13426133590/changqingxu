function calculateAge(birthDate) {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function getZodiac(year) {
  const animals = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊']
  return animals[year % 12]
}

function getZodiacSign(month, day) {
  const signs = [
    { sign: '摩羯座', endDay: 19 },
    { sign: '水瓶座', endDay: 18 },
    { sign: '双鱼座', endDay: 20 },
    { sign: '白羊座', endDay: 19 },
    { sign: '金牛座', endDay: 20 },
    { sign: '双子座', endDay: 21 },
    { sign: '巨蟹座', endDay: 22 },
    { sign: '狮子座', endDay: 22 },
    { sign: '处女座', endDay: 22 },
    { sign: '天秤座', endDay: 22 },
    { sign: '天蝎座', endDay: 21 },
    { sign: '射手座', endDay: 21 },
    { sign: '摩羯座', endDay: 31 },
  ]
  const signIndex = day <= signs[month - 1].endDay ? month - 1 : month
  return signs[signIndex].sign
}

function calculateZodiacInfo(birthDate) {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const zodiac = getZodiac(year)
  const zodiacSign = getZodiacSign(month, day)
  const seed = year * 10000 + month * 100 + day
  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ]
  const riyuanTypes = ['甲木', '乙木', '丙火', '丁火', '戊土', '己土', '庚金', '辛金', '壬水', '癸水']
  return {
    zodiac,
    zodiacSign,
    mbti: mbtiTypes[seed % mbtiTypes.length],
    riyuan: riyuanTypes[seed % riyuanTypes.length],
  }
}

module.exports = {
  calculateAge,
  getZodiac,
  getZodiacSign,
  calculateZodiacInfo,
}
