import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VipService } from './vip.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/vip.dto';

@ApiTags('VIP')
@Controller('vip')
export class VipController {
  constructor(private readonly vipService: VipService) {}

  @Get('plans')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取 VIP 套餐列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPlans() {
    return this.vipService.getPlans();
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.vipService.createOrder(userId, createOrderDto);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询订单状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.vipService.getOrder(userId, orderId);
  }

  /** 开发联调：仅 development + VIP_MOCK_PAY=1 时模拟支付成功 */
  @Post('orders/:id/mock-pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '模拟支付成功（开发）' })
  @ApiResponse({ status: 200, description: '模拟成功' })
  async mockPay(@Param('id') orderId: string, @CurrentUser('id') userId: string) {
    return this.vipService.mockCompleteOrder(userId, orderId);
  }
}
