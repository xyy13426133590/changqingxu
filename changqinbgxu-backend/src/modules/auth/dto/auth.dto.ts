import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsMobilePhone,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsMobilePhone('zh-CN', {}, { message: '请输入正确的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码最少6位' })
  @MaxLength(32, { message: '密码最多32位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ description: '昵称', example: '小明' })
  @IsString({ message: '昵称必须是字符串' })
  @MinLength(2, { message: '昵称最少2个字符' })
  @MaxLength(16, { message: '昵称最多16个字符' })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickname: string;

  @ApiProperty({ description: '验证码（可选，演示环境）', example: '888888', required: false })
  @IsOptional()
  @IsString()
  code?: string;
}

export class LoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsMobilePhone('zh-CN', {}, { message: '请输入正确的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码最少6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

export class SmsLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsMobilePhone('zh-CN', {}, { message: '请输入正确的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({ description: '验证码', example: '888888' })
  @IsString({ message: '验证码必须是字符串' })
  @MinLength(4, { message: '验证码最少4位' })
  @MaxLength(6, { message: '验证码最多6位' })
  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;
}

export class SendSmsDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsMobilePhone('zh-CN', {}, { message: '请输入正确的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({ description: '类型', example: 'login', enum: ['login', 'register', 'reset'] })
  @IsEnum(['login', 'register', 'reset'], { message: '类型必须是 login, register 或 reset' })
  @IsOptional()
  type?: 'login' | 'register' | 'reset';
}

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录 code', example: 'xxxxxxxx' })
  @IsString({ message: 'code 必须是字符串' })
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;

  @ApiProperty({ description: '用户信息（加密）', example: 'encryptedData', required: false })
  @IsOptional()
  @IsString()
  encryptedData?: string;

  @ApiProperty({ description: '加密算法的初始向量', example: 'iv', required: false })
  @IsOptional()
  @IsString()
  iv?: string;
}

export class RealNameDto {
  @ApiProperty({ description: '真实姓名', example: '张三' })
  @IsString({ message: '姓名必须是字符串' })
  @MinLength(2, { message: '姓名最少2个字符' })
  @MaxLength(20, { message: '姓名最多20个字符' })
  @IsNotEmpty({ message: '姓名不能为空' })
  legalName: string;

  @ApiProperty({ description: '身份证号', example: '110101199001011234' })
  @IsString({ message: '身份证号必须是字符串' })
  @MinLength(15, { message: '身份证号格式错误' })
  @MaxLength(18, { message: '身份证号格式错误' })
  @IsNotEmpty({ message: '身份证号不能为空' })
  idCard: string;
}

export class FaceVerifyDto {
  @ApiProperty({ description: '人脸图片 Base64', example: 'data:image/jpeg;base64,...' })
  @IsString({ message: '人脸图片必须是字符串' })
  @IsNotEmpty({ message: '人脸图片不能为空' })
  faceImage: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIs...' })
  @IsString({ message: '刷新令牌必须是字符串' })
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: string;
    phone: string;
    nickname: string;
    avatar: string;
    isRealName: boolean;
    isFaceVerified: boolean;
    isVip: boolean;
  };
}
