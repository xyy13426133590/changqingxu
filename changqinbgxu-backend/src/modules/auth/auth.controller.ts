import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  RegisterDto,
  LoginDto,
  SmsLoginDto,
  SendSmsDto,
  WechatLoginDto,
  RealNameDto,
  FaceVerifyDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '参数错误或手机号已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手机号+密码登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '手机号或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('sms-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手机号+验证码登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '验证码错误或已过期' })
  async smsLogin(@Body() smsLoginDto: SmsLoginDto) {
    return this.authService.smsLogin(smsLoginDto);
  }

  @Public()
  @Post('send-sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送短信验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({ status: 400, description: '手机号格式错误' })
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    return this.authService.sendSms(sendSmsDto);
  }

  @Public()
  @Post('wechat-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '微信授权失败' })
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('real-name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '实名认证' })
  @ApiResponse({ status: 200, description: '认证成功' })
  @ApiResponse({ status: 400, description: '身份信息验证失败' })
  async realName(
    @CurrentUser('id') userId: string,
    @Body() realNameDto: RealNameDto,
  ) {
    return this.authService.realName(userId, realNameDto);
  }

  @Post('face-verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '人脸核验' })
  @ApiResponse({ status: 200, description: '核验成功' })
  @ApiResponse({ status: 400, description: '人脸核验失败' })
  async faceVerify(
    @CurrentUser('id') userId: string,
    @Body() faceVerifyDto: FaceVerifyDto,
  ) {
    return this.authService.faceVerify(userId, faceVerifyDto);
  }
}
