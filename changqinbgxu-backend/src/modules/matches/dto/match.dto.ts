import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LikeUserDto {
  @ApiProperty({ description: '目标用户ID', example: 'uuid-string' })
  @IsUUID('4', { message: '目标用户ID格式错误' })
  @IsNotEmpty({ message: '目标用户ID不能为空' })
  targetUserId: string;
}

export class PassUserDto {
  @ApiProperty({ description: '目标用户ID', example: 'uuid-string' })
  @IsUUID('4', { message: '目标用户ID格式错误' })
  @IsNotEmpty({ message: '目标用户ID不能为空' })
  targetUserId: string;
}

export class SuperLikeUserDto {
  @ApiProperty({ description: '目标用户ID', example: 'uuid-string' })
  @IsUUID('4', { message: '目标用户ID格式错误' })
  @IsNotEmpty({ message: '目标用户ID不能为空' })
  targetUserId: string;
}

export class MatchResponseDto {
  id: string;
  userId: string;
  targetUserId: string;
  action: string;
  isMutual: boolean;
  createdAt: Date;
  targetUser?: {
    id: string;
    nickname: string;
    avatar: string;
  };
}
