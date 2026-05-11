import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/conversation.dto';

@ApiTags('会话')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取会话列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getConversations(@CurrentUser('id') userId: string) {
    return this.conversationsService.getConversations(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建会话' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createConversation(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(userId, createDto.targetUserId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除会话' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteConversation(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.deleteConversation(userId, conversationId);
  }

  @Put(':id/top')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '置顶/取消置顶会话' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async togglePin(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.togglePin(userId, conversationId);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取消息历史' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.conversationsService.getMessages(userId, conversationId, page, limit);
  }
}
