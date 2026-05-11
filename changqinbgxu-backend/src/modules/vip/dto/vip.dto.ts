import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '套餐ID', example: 'uuid-string' })
  @IsUUID('4', { message: '套餐ID格式错误' })
  @IsNotEmpty({ message: '套餐ID不能为空' })
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
