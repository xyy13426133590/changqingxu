import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const req = context.switchToHttp().getRequest<{ url?: string }>();
    if (typeof req.url === 'string' && req.url.includes('payment/wechat-notify')) {
      return next.handle() as Observable<Response<T>>;
    }
    return next.handle().pipe(
      map((data) => ({
        code: 'SUCCESS',
        message: '请求成功',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
