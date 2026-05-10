"use strict";
const ZODIAC_ANIMALS = ["猴", "鸡", "狗", "猪", "鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊"];
const ZODIAC_SIGNS = [
  { name: "白羊座", start: "03-21", end: "04-19" },
  { name: "金牛座", start: "04-20", end: "05-20" },
  { name: "双子座", start: "05-21", end: "06-21" },
  { name: "巨蟹座", start: "06-22", end: "07-22" },
  { name: "狮子座", start: "07-23", end: "08-22" },
  { name: "处女座", start: "08-23", end: "09-22" },
  { name: "天秤座", start: "09-23", end: "10-23" },
  { name: "天蝎座", start: "10-24", end: "11-22" },
  { name: "射手座", start: "11-23", end: "12-21" },
  { name: "摩羯座", start: "12-22", end: "01-19" },
  { name: "水瓶座", start: "01-20", end: "02-18" },
  { name: "双鱼座", start: "02-19", end: "03-20" }
];
const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP"
];
const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
function getZodiac(year) {
  const baseYear = 1900;
  const baseIndex = 0;
  const offset = (year - baseYear) % 12;
  return ZODIAC_ANIMALS[(baseIndex + offset) % 12];
}
function getZodiacSign(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  for (const sign of ZODIAC_SIGNS) {
    if (sign.name === "摩羯座") {
      if (dateStr >= "12-22" || dateStr <= "01-19") {
        return sign.name;
      }
    } else if (dateStr >= sign.start && dateStr <= sign.end) {
      return sign.name;
    }
  }
  return "白羊座";
}
function getMBTI(birthDate) {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const seed = year * 1e4 + month * 100 + day;
  const index = seed % MBTI_TYPES.length;
  return MBTI_TYPES[index];
}
function getRiyuan(birthDate) {
  const day = birthDate.getDate();
  const ganIndex = (day + 4) % 10;
  const zhiIndex = (day + 2) % 12;
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}
function getBirthInfo(birthDate) {
  const year = birthDate.getFullYear();
  return {
    zodiac: getZodiac(year),
    // 生肖
    zodiacSign: getZodiacSign(birthDate),
    // 星座
    riyuan: getRiyuan(birthDate),
    // 日柱
    mbti: getMBTI(birthDate)
    // MBTI
  };
}
function getZodiacEmoji(zodiac) {
  const map = {
    "鼠": "🐭",
    "牛": "🐮",
    "虎": "🐯",
    "兔": "🐰",
    "龙": "🐲",
    "蛇": "🐍",
    "马": "🐴",
    "羊": "🐑",
    "猴": "🐵",
    "鸡": "🐔",
    "狗": "🐶",
    "猪": "🐷"
  };
  return map[zodiac] || "🐰";
}
function getZodiacSignSymbol(signName) {
  const map = {
    白羊座: "♈",
    金牛座: "♉",
    双子座: "♊",
    巨蟹座: "♋",
    狮子座: "♌",
    处女座: "♍",
    天秤座: "♎",
    天蝎座: "♏",
    射手座: "♐",
    摩羯座: "♑",
    水瓶座: "♒",
    双鱼座: "♓"
  };
  return map[signName] || "⭐";
}
exports.getBirthInfo = getBirthInfo;
exports.getZodiacEmoji = getZodiacEmoji;
exports.getZodiacSignSymbol = getZodiacSignSymbol;
