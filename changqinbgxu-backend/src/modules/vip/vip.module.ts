import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VipController } from './vip.controller';
import { VipPaymentController } from './vip-payment.controller';
import { VipService } from './vip.service';
import { WechatPayService } from '../payment/wechat-pay.service';
import { VipPlan } from '../../database/entities/vip-plan.entity';
import { VipOrder } from '../../database/entities/vip-order.entity';
import { User } from '../../database/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([VipPlan, VipOrder, User]), UsersModule],
  controllers: [VipController, VipPaymentController],
  providers: [VipService, WechatPayService],
  exports: [VipService],
})
export class VipModule {}
