import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice',
  EMOJI = 'emoji',
  SYSTEM = 'system',
}

export class SendMessageDto {
  @ApiProperty({ description: '会话ID', example: 'uuid-string' })
  @IsUUID('4', { message: '会话ID格式错误' })
  @IsNotEmpty({ message: '会话ID不能为空' })
  conversationId: string;

  @ApiProperty({ description: '接收者ID', example: 'uuid-string' })
  @IsUUID('4', { message: '接收者ID格式错误' })
  @IsNotEmpty({ message: '接收者ID不能为空' })
  receiverId: string;

  @ApiProperty({ description: '消息类型', enum: MessageType, example: MessageType.TEXT })
  @IsEnum(MessageType, { message: '消息类型错误' })
  @IsNotEmpty({ message: '消息类型不能为空' })
  type: MessageType;

  @ApiProperty({ description: '消息内容', example: '你好！' })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({ description: '媒体URL（图片/语音）', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl({}, { message: '媒体URL格式错误' })
  mediaUrl?: string;

  @ApiPropertyOptional({ description: '媒体时长（语音）', example: 10 })
  @IsOptional()
  @IsNumber({}, { message: '时长必须是数字' })
  mediaDuration?: number;
}

export class MarkReadDto {
  @ApiProperty({ description: '会话ID', example: 'uuid-string' })
  @IsUUID('4', { message: '会话ID格式错误' })
  @IsNotEmpty({ message: '会话ID不能为空' })
  conversationId: string;
}

export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  mediaDuration?: number;
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    nickname: string;
    avatar: string;
  };
}
