"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = calculateAge;
exports.getZodiac = getZodiac;
exports.getZodiacSign = getZodiacSign;
exports.formatDate = formatDate;
function calculateAge(birthDate) {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}
function getZodiac(year) {
    const animals = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
    return animals[year % 12];
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
    ];
    const signIndex = day <= signs[month - 1].endDay ? month - 1 : month;
    return signs[signIndex].sign;
}
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');
    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second);
}
//# sourceMappingURL=date.util.js.map