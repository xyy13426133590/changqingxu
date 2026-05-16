/**
 * 本地联调：写入一批可登录用户（密码均为 test888）。
 * 须已配置 .env 并成功连库。执行：pnpm run seed:dev
 * 已存在手机号会补全头像与资料字段（不覆盖已有非空头像）。
 */
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/database/entities/user.entity';

const PASSWORD = 'test888';

type SeedRow = Partial<User> & {
  phone: string;
  avatar: string;
};

const SEED_USERS: SeedRow[] = [
  {
    phone: '13800138001',
    nickname: '林溪',
    gender: 'female',
    age: 26,
    height: 162,
    location: '北京朝阳区',
    zodiac: '兔',
    zodiacSign: '天秤座',
    mbti: 'INFP',
    riyuan: '甲木',
    education: '本科',
    occupation: '产品经理',
    income: '20万-30万',
    bio: '喜欢旅行、摄影和烘焙～',
    hobbies: ['旅行', '摄影'],
    avatar: '/static/avatars/demo-0.jpg',
    status: 'active',
  },
  {
    phone: '13800138002',
    nickname: '苏晴',
    gender: 'female',
    age: 28,
    height: 165,
    location: '上海浦东',
    zodiac: '牛',
    zodiacSign: '天蝎座',
    mbti: 'ENFJ',
    riyuan: '乙木',
    education: '硕士及以上',
    occupation: '分析师',
    income: '30万-50万',
    bio: '认真生活，慢慢来。',
    hobbies: ['跑步'],
    avatar: '/static/avatars/demo-1.jpg',
    status: 'active',
  },
  {
    phone: '13800138003',
    nickname: '书言',
    gender: 'male',
    age: 29,
    height: 178,
    location: '深圳南山',
    zodiac: '狗',
    zodiacSign: '射手座',
    mbti: 'INTJ',
    riyuan: '丙火',
    education: '本科',
    occupation: '研发工程师',
    income: '30万-50万',
    bio: '想找聊得来的人。',
    hobbies: ['电影'],
    avatar: '/static/avatars/demo-3.jpg',
    status: 'active',
  },
  {
    phone: '13800138004',
    nickname: '时宜',
    gender: 'female',
    age: 25,
    height: 160,
    location: '杭州西湖',
    zodiac: '龙',
    zodiacSign: '双鱼座',
    mbti: 'ISFP',
    riyuan: '丁火',
    education: '本科',
    occupation: '运营',
    income: '10万-20万',
    bio: '慢热型，熟悉之后很话唠。',
    hobbies: ['美食'],
    avatar: '/static/avatars/demo-4.jpg',
    status: 'active',
  },
  {
    phone: '13800138005',
    nickname: '安然',
    gender: 'female',
    age: 27,
    height: 166,
    location: '成都高新区',
    zodiac: '虎',
    zodiacSign: '狮子座',
    mbti: 'ENFP',
    riyuan: '戊土',
    education: '本科',
    occupation: '设计师',
    income: '20万-30万',
    bio: '期待同频的你。',
    hobbies: ['美食'],
    avatar: '/static/avatars/demo-2.jpg',
    status: 'active',
  },
  // 补足演示池：主页「每日推荐」最多展示 10 人，池中须明显多于 10（含登录者自身及其他账号）
  {
    phone: '13800138006',
    nickname: '知夏',
    gender: 'female',
    age: 24,
    height: 163,
    location: '广州天河',
    zodiac: '蛇',
    zodiacSign: '双子座',
    mbti: 'ISTJ',
    riyuan: '己土',
    education: '本科',
    occupation: '教师',
    income: '10万-20万',
    bio: '喜欢音乐和周末市集。',
    hobbies: ['音乐', '咖啡'],
    avatar: '/static/avatars/demo-0.jpg',
    status: 'active',
  },
  {
    phone: '13800138007',
    nickname: '景行',
    gender: 'male',
    age: 30,
    height: 176,
    location: '武汉光谷',
    zodiac: '猪',
    zodiacSign: '摩羯座',
    mbti: 'ESTP',
    riyuan: '庚金',
    education: '硕士及以上',
    occupation: '法务',
    income: '30万-50万',
    bio: '跑步与纪录片爱好者。',
    hobbies: ['跑步', '纪录片'],
    avatar: '/static/avatars/demo-3.jpg',
    status: 'active',
  },
  {
    phone: '13800138008',
    nickname: '晚乔',
    gender: 'female',
    age: 27,
    height: 167,
    location: '南京鼓楼',
    zodiac: '虎',
    zodiacSign: '水瓶座',
    mbti: 'INFJ',
    riyuan: '辛金',
    education: '本科',
    occupation: '策展',
    income: '20万-30万',
    bio: '慢节奏生活，也爱看展。',
    hobbies: ['看展'],
    avatar: '/static/avatars/demo-4.jpg',
    status: 'active',
  },
  {
    phone: '13800138009',
    nickname: '子墨',
    gender: 'male',
    age: 28,
    height: 179,
    location: '西安雁塔',
    zodiac: '牛',
    zodiacSign: '巨蟹座',
    mbti: 'ENTP',
    riyuan: '壬水',
    education: '本科',
    occupation: '创业者',
    income: '50万以上',
    bio: '工作与充电都要兼顾。',
    hobbies: ['阅读', '露营'],
    avatar: '/static/avatars/demo-1.jpg',
    status: 'active',
  },
  {
    phone: '13800138010',
    nickname: '清欢',
    gender: 'female',
    age: 26,
    height: 164,
    location: '厦门思明',
    zodiac: '兔',
    zodiacSign: '处女座',
    mbti: 'ISFJ',
    riyuan: '癸水',
    education: '本科',
    occupation: '人力资源',
    income: '20万-30万',
    bio: '希望遇见温柔且坚定的人。',
    hobbies: ['瑜伽'],
    avatar: '/static/avatars/demo-2.jpg',
    status: 'active',
  },
  {
    phone: '13800138011',
    nickname: '南乔',
    gender: 'female',
    age: 25,
    height: 161,
    location: '重庆渝北',
    zodiac: '龙',
    zodiacSign: '白羊座',
    mbti: 'ESFP',
    riyuan: '甲木',
    education: '本科',
    occupation: '新媒体',
    income: '10万-20万',
    bio: '爱吃辣，也爱聊天。',
    hobbies: ['火锅', '播客'],
    avatar: '/static/avatars/demo-0.jpg',
    status: 'active',
  },
  {
    phone: '13800138012',
    nickname: '以安',
    gender: 'male',
    age: 31,
    height: 177,
    location: '青岛崂山',
    zodiac: '狗',
    zodiacSign: '金牛座',
    mbti: 'INTP',
    riyuan: '乙木',
    education: '硕士及以上',
    occupation: '数据科学家',
    income: '50万以上',
    bio: '逻辑控，偶尔也会做饭。',
    hobbies: ['下厨', '桌游'],
    avatar: '/static/avatars/demo-3.jpg',
    status: 'active',
  },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const repo = app.get<Repository<User>>(getRepositoryToken(User));
  const hash = await bcrypt.hash(PASSWORD, 10);
  let created = 0;
  let updated = 0;

  for (const row of SEED_USERS) {
    const { phone, avatar, ...profile } = row;
    const exists = await repo.findOne({ where: { phone } });

    if (exists) {
      const patch: Partial<User> = {
        nickname: profile.nickname ?? exists.nickname,
        gender: profile.gender ?? exists.gender,
        age: profile.age ?? exists.age,
        height: profile.height ?? exists.height,
        location: profile.location ?? exists.location,
        zodiac: profile.zodiac || exists.zodiac,
        zodiacSign: profile.zodiacSign || exists.zodiacSign,
        mbti: profile.mbti || exists.mbti,
        riyuan: profile.riyuan || exists.riyuan,
        education: profile.education || exists.education,
        occupation: profile.occupation || exists.occupation,
        income: profile.income || exists.income,
        bio: profile.bio || exists.bio,
        hobbies:
          profile.hobbies?.length ? profile.hobbies : exists.hobbies,
      };
      if (!exists.avatar?.trim()) {
        patch.avatar = avatar;
      }
      await repo.update(exists.id, patch);
      updated++;
      continue;
    }

    const u = repo.create({
      ...profile,
      phone,
      passwordHash: hash,
      avatar,
    });
    await repo.save(u);
    created++;
  }

  console.log(
    `seed:dev 完成：新建 ${created} 个，补全资料 ${updated} 个。密码：${PASSWORD}`,
  );
  console.log(
    `演示账号：${SEED_USERS.map((x) => x.phone).join(', ')}；头像路径 /static/avatars/demo-*.jpg`,
  );
  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
