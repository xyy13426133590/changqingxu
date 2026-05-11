import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
  Query,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  UpdateProfileDto,
  UpdateFiltersDto,
  UserResponseDto,
  UserCardDto,
  ReportUserDto,
} from './dto/user.dto';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户资料' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMe(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户资料' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Put('me/filters')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新筛选条件' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateFilters(
    @CurrentUser('id') userId: string,
    @Body() updateFiltersDto: UpdateFiltersDto,
  ): Promise<{ filterSettings: Record<string, any> }> {
    return this.usersService.updateFilters(userId, updateFiltersDto);
  }

  @Get('me/vip')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取 VIP 状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getVipStatus(@CurrentUser('id') userId: string) {
    return this.usersService.getVipStatus(userId);
  }

  @Get('me/card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的资料卡' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyCard(@CurrentUser('id') userId: string) {
    return this.usersService.getUserCard(userId);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取推荐用户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecommendations(
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ users: UserCardDto[]; total: number }> {
    return this.usersService.getRecommendations(userId, page, limit);
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取每日推荐' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDailyRecommendations(
    @CurrentUser('id') userId: string,
  ): Promise<{ users: UserCardDto[] }> {
    return this.usersService.getDailyRecommendations(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserById(
    @Param('id') userId: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<UserCardDto> {
    return this.usersService.getUserDetail(userId, currentUserId);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '举报用户' })
  @ApiResponse({ status: 200, description: '举报成功' })
  async reportUser(
    @Param('id') targetUserId: string,
    @CurrentUser('id') userId: string,
    @Body() reportDto: ReportUserDto,
  ): Promise<{ message: string }> {
    return this.usersService.reportUser(userId, targetUserId, reportDto);
  }
}
