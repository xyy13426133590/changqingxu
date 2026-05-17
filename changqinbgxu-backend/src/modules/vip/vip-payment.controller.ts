import { Controller, Post, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { RawBodyRequest } from '@nestjs/common';
import { VipService } from './vip.service';

@ApiTags('VIP')
@ApiExcludeController()
@Controller('vip')
export class VipPaymentController {
  constructor(private readonly vipService: VipService) {}

  /** 微信支付代金券/结果通知，无 JWT；须在商户平台配置为 HTTPS 地址 */
  @Post('payment/wechat-notify')
  @HttpCode(HttpStatus.OK)
  async wechatNotify(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody;
    if (!raw) {
      return { code: 'FAIL', message: 'missing raw body' };
    }
    const body = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
    return this.vipService.handleWechatNotify(body, req.headers as Record<string, string | string[] | undefined>);
  }
}
