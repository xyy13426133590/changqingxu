import { IsNotEmpty, IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '套餐ID', example: 'plan-1-month' })
  @IsString({ message: '套餐ID格式错误' })
  @IsNotEmpty({ message: '套餐ID不能为空' })
  @MaxLength(36, { message: '套餐ID格式错误' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '套餐ID格式错误' })
  planId: string;

  @ApiPropertyOptional({ description: '支付方式', example: 'wechat' })
  @IsOptional()
  @IsString()
  payMethod?: string;
}

export class VipPlanResponseDto {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  originalPrice?: number;
  features: string[];
  tag?: string;
  sortOrder: number;
}

export class VipOrderResponseDto {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  status: string;
  payMethod?: string;
  payTime?: Date;
  expiresAt?: Date;
  createdAt: Date;
  plan?: VipPlanResponseDto;
}

/** 小程序调起支付参数 */
export class MiniProgramPaymentDto {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: 'RSA';
  paySign: string;
}

/** 创建订单接口返回 */
export class CreateOrderResultDto {
  order: VipOrderResponseDto;
  payment?: MiniProgramPaymentDto;
  paymentMode: 'live' | 'mock';
}
