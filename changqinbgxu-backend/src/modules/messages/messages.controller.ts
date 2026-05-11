import {
  Controller,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SendMessageDto, MarkReadDto } from './dto/message.dto';

@ApiTags('消息')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送消息（REST API 备选）' })
  @ApiResponse({ status: 200, description: '发送成功' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(userId, sendMessageDto);
  }

  @Put('read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '标记消息已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  async markRead(
    @CurrentUser('id') userId: string,
    @Body() markReadDto: MarkReadDto,
  ) {
    return this.messagesService.markMessagesRead(userId, markReadDto.conversationId);
  }
}
