import type { Request } from 'express';
import { RawBodyRequest } from '@nestjs/common';
import { VipService } from './vip.service';
export declare class VipPaymentController {
    private readonly vipService;
    constructor(vipService: VipService);
    wechatNotify(req: RawBodyRequest<Request>): Promise<{
        code: string;
        message: string;
    }>;
}
