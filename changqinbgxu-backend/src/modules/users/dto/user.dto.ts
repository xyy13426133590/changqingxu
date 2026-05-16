import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
  IsArray,
  MaxLength,
  MinLength,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称', example: '小明' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '昵称最少2个字符' })
  @MaxLength(16, { message: '昵称最多16个字符' })
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl({}, { message: '头像必须是有效的URL' })
  avatar?: string;

  @ApiPropertyOptional({ description: '性别', example: 'male', enum: ['male', 'female', 'unknown'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'unknown'])
  gender?: 'male' | 'female' | 'unknown';

  @ApiPropertyOptional({ description: '生日', example: '1990-01-01' })
  @IsOptional()
  birthday?: string;

  @ApiPropertyOptional({ description: '身高(cm)', example: 175 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: '体重(kg)', example: 70 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: '家乡', example: '北京市' })
  @IsOptional()
  @IsString()
  hometown?: string;

  @ApiPropertyOptional({ description: '当前位置', example: '北京市朝阳区' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '学历', example: '本科' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ description: '学校', example: '北京大学' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({ description: '学校档次', example: '985', enum: ['985', '211', null] })
  @IsOptional()
  @IsEnum(['985', '211', null])
  schoolTier?: '985' | '211' | null;

  @ApiPropertyOptional({ description: '职业', example: '产品经理' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: '职位级别', example: '高级' })
  @IsOptional()
  @IsString()
  jobLevel?: string;

  @ApiPropertyOptional({ description: '公司', example: '阿里巴巴' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '年收入', example: '20万-30万' })
  @IsOptional()
  @IsString()
  income?: string;

  @ApiPropertyOptional({ description: '个人介绍', example: '热爱生活，喜欢旅行...' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '个人介绍最多500字' })
  bio?: string;

  @ApiPropertyOptional({ description: '兴趣爱好', example: ['旅行', '摄影', '阅读'] })
  @IsOptional()
  @IsArray()
  hobbies?: string[];
}

export class UpdateFiltersDto {
  @ApiPropertyOptional({ description: '年龄范围', example: { min: 20, max: 35 } })
  @IsOptional()
  ageRange?: { min: number; max: number };

  @ApiPropertyOptional({ description: '生肖配对偏好', example: ['三合', '六合'] })
  @IsOptional()
  zodiacMatch?: string[];

  @ApiPropertyOptional({ description: '距离范围(km)', example: 50 })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiPropertyOptional({ description: '学历要求', example: ['本科', '硕士'] })
  @IsOptional()
  education?: string[];

  @ApiPropertyOptional({ description: '收入范围', example: { min: '10万', max: '50万' } })
  @IsOptional()
  incomeRange?: { min: string; max: string };
}

export class ReportUserDto {
  @ApiProperty({ description: '举报原因', example: '发布不当内容' })
  @IsString()
  @IsNotEmpty({ message: '举报原因不能为空' })
  reason: string;

  @ApiPropertyOptional({ description: '详细描述', example: '该用户发布违规内容...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '截图证据URL数组', example: ['https://example.com/evidence1.jpg'] })
  @IsOptional()
  @IsArray()
  evidence?: string[];
}

export class UserResponseDto {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  gender: string;
  age: number;
  height: number;
  location: string;
  zodiac: string;
  zodiacSign: string;
  mbti: string;
  education: string;
  occupation: string;
  income: string;
  bio: string;
  hobbies: string[];
  isRealName: boolean;
  isFaceVerified: boolean;
  isVip: boolean;
  vipExpiry: Date;
  filterSettings: Record<string, any>;
  createdAt: Date;
}

export class UserCardDto {
  id: string;
  nickname: string;
  avatar: string;
  gender: string;
  age: number;
  height: number;
  weight?: number | null;
  hometown: string;
  location: string;
  zodiac: string;
  zodiacSign: string;
  mbti: string;
  riyuan: string;
  education: string;
  school?: string;
  schoolTier?: '985' | '211' | null;
  occupation: string;
  jobLevel?: string;
  company?: string;
  income: string;
  bio: string;
  hobbies: string[];
  isRealName: boolean;
  isFaceVerified: boolean;
  isVip: boolean;
  matchReason: string;
  matchTagline: string;
  matchScore: number;
}
