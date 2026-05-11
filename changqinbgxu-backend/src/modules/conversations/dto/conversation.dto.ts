import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: '目标用户ID', example: 'uuid-string' })
  @IsUUID('4', { message: '目标用户ID格式错误' })
  @IsNotEmpty({ message: '目标用户ID不能为空' })
  targetUserId: string;
}

export class ConversationResponseDto {
  id: string;
  userId: string;
  targetUserId: string;
  targetUser: {
    id: string;
    nickname: string;
    avatar: string;
  };
  lastMessage: {
    id: string;
    content: string;
    type: string;
    createdAt: Date;
  } | null;
  unreadCount: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
