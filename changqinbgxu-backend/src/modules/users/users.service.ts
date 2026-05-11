import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Match } from '../../database/entities/match.entity';
import {
  UpdateProfileDto,
  UpdateFiltersDto,
  UserResponseDto,
  UserCardDto,
  ReportUserDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  /**
   * 根据 ID 获取用户信息
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, status: 'active' },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUserResponse(user);
  }

  /**
   * 更新用户资料
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const userUpdates: Record<string, unknown> = { ...updateProfileDto };

    // 如果更新生日，自动计算年龄和生辰信息
    if (updateProfileDto.birthday) {
      const birthDate = new Date(updateProfileDto.birthday);
      userUpdates.age = this.calculateAge(birthDate);
      Object.assign(userUpdates, this.calculateZodiacInfo(birthDate));
    }

    Object.assign(user, userUpdates);
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`用户资料更新成功: ${userId}`);

    return this.formatUserResponse(updatedUser);
  }

  /**
   * 更新筛选条件
   */
  async updateFilters(
    userId: string,
    updateFiltersDto: UpdateFiltersDto,
  ): Promise<{ filterSettings: Record<string, any> }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.filterSettings = {
      ...user.filterSettings,
      ...updateFiltersDto,
    };

    await this.userRepository.save(user);

    return { filterSettings: user.filterSettings };
  }

  /**
   * 获取 VIP 状态
   */
  async getVipStatus(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['isVip', 'vipExpiry'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const now = new Date();
    const isVipActive = user.isVip && user.vipExpiry && user.vipExpiry > now;

    return {
      isVip: isVipActive,
      vipExpiry: user.vipExpiry,
      daysRemaining: isVipActive
        ? Math.ceil((user.vipExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    };
  }

  /**
   * 获取用户卡片信息
   */
  async getUserCard(userId: string): Promise<UserCardDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, status: 'active' },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUserCard(user, userId);
  }

  /**
   * 获取推荐用户列表
   */
  async getRecommendations(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: UserCardDto[]; total: number }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取已匹配过的用户ID
    const matchedUserIds = await this.getMatchedUserIds(userId);

    // 排除已匹配用户和自己
    const excludedIds = [...matchedUserIds, userId];

    // 构建查询条件
    const whereCondition: any = {
      id: Not(In(excludedIds)),
      status: 'active',
    };

    // 应用筛选条件
    if (user.filterSettings) {
      const { ageRange, education, incomeRange } = user.filterSettings;

      if (ageRange) {
        whereCondition.age = Not(In([])); // 后续实现年龄范围过滤
      }
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
    });

    const userCards = users.map((u) => this.formatUserCard(u, userId));

    return { users: userCards, total };
  }

  /**
   * 获取每日推荐
   */
  async getDailyRecommendations(
    userId: string,
  ): Promise<{ users: UserCardDto[] }> {
    // 随机获取 10 个活跃用户
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere('user.status = :status', { status: 'active' })
      .orderBy('RAND()')
      .limit(10)
      .getMany();

    const userCards = users.map((u) => this.formatUserCard(u, userId));

    return { users: userCards };
  }

  /**
   * 获取用户详情
   */
  async getUserDetail(
    userId: string,
    currentUserId: string,
  ): Promise<UserCardDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, status: 'active' },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUserCard(user, currentUserId);
  }

  /**
   * 举报用户
   */
  async reportUser(
    userId: string,
    targetUserId: string,
    reportDto: ReportUserDto,
  ): Promise<{ message: string }> {
    // TODO: 保存举报记录到数据库
    this.logger.log(`用户 ${userId} 举报了用户 ${targetUserId}: ${reportDto.reason}`);

    return { message: '举报成功，我们会尽快处理' };
  }

  /**
   * 获取已匹配用户ID列表
   */
  private async getMatchedUserIds(userId: string): Promise<string[]> {
    const matches = await this.matchRepository.find({
      where: { userId },
      select: ['targetUserId'],
    });

    return matches.map((match) => match.targetUserId);
  }

  /**
   * 计算年龄
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * 计算生辰信息（生肖、星座、日柱）
   */
  private calculateZodiacInfo(birthDate: Date): {
    zodiac: string;
    zodiacSign: string;
    mbti: string;
    riyuan: string;
  } {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    // 计算生肖
    const zodiacAnimals = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
    const zodiac = zodiacAnimals[year % 12];

    // 计算星座
    const zodiacSign = this.getZodiacSign(month, day);

    // 生成伪随机的 MBTI 和日柱（实际应根据更复杂的算法）
    const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                       'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    const mbti = mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)];

    const riyuanTypes = ['甲木', '乙木', '丙火', '丁火', '戊土', '己土', '庚金', '辛金', '壬水', '癸水'];
    const riyuan = riyuanTypes[Math.floor(Math.random() * riyuanTypes.length)];

    return { zodiac, zodiacSign, mbti, riyuan };
  }

  /**
   * 根据月份和日期获取星座
   */
  private getZodiacSign(month: number, day: number): string {
    const zodiacSigns = [
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

    const signIndex = day <= zodiacSigns[month - 1].endDay ? month - 1 : month;
    return zodiacSigns[signIndex].sign;
  }

  /**
   * 格式化用户响应
   */
  private formatUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      age: user.age,
      height: user.height,
      location: user.location,
      zodiac: user.zodiac,
      zodiacSign: user.zodiacSign,
      mbti: user.mbti,
      education: user.education,
      occupation: user.occupation,
      income: user.income,
      bio: user.bio,
      hobbies: user.hobbies || [],
      isRealName: user.isRealName,
      isFaceVerified: user.isFaceVerified,
      isVip: user.isVip,
      vipExpiry: user.vipExpiry,
      filterSettings: user.filterSettings || {},
      createdAt: user.createdAt,
    };
  }

  /**
   * 格式化用户卡片
   */
  private formatUserCard(user: User, currentUserId: string): UserCardDto {
    // 生成匹配信息（实际应该基于生辰八字算法）
    const matchReasons = ['生肖三合', '星座配对', '日柱相生', '五行互补'];
    const matchReason = matchReasons[Math.floor(Math.random() * matchReasons.length)];
    const matchTaglines = ['志趣相投', '天生一对', '缘分天定', '相辅相成'];
    const matchTagline = matchTaglines[Math.floor(Math.random() * matchTaglines.length)];
    const matchScore = Math.floor(Math.random() * 30) + 70; // 70-99

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      age: user.age,
      height: user.height,
      location: user.location,
      zodiac: user.zodiac,
      zodiacSign: user.zodiacSign,
      mbti: user.mbti,
      riyuan: user.riyuan,
      education: user.education,
      occupation: user.occupation,
      income: user.income,
      bio: user.bio,
      hobbies: user.hobbies || [],
      isRealName: user.isRealName,
      isVip: user.isVip,
      matchReason: matchReason,
      matchTagline: matchTagline,
      matchScore: matchScore,
    };
  }
}
