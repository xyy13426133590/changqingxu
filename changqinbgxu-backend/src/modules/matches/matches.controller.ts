import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LikeUserDto, PassUserDto, SuperLikeUserDto } from './dto/match.dto';

@ApiTags('匹配')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '喜欢用户' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async likeUser(
    @CurrentUser('id') userId: string,
    @Body() likeUserDto: LikeUserDto,
  ) {
    return this.matchesService.likeUser(userId, likeUserDto.targetUserId);
  }

  @Post('pass')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '不喜欢用户' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async passUser(
    @CurrentUser('id') userId: string,
    @Body() passUserDto: PassUserDto,
  ) {
    return this.matchesService.passUser(userId, passUserDto.targetUserId);
  }

  @Post('super-like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '超级喜欢用户' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async superLikeUser(
    @CurrentUser('id') userId: string,
    @Body() superLikeUserDto: SuperLikeUserDto,
  ) {
    return this.matchesService.superLikeUser(userId, superLikeUserDto.targetUserId);
  }

  @Get('mutual')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取互相喜欢的人' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMutualMatches(@CurrentUser('id') userId: string) {
    return this.matchesService.getMutualMatches(userId);
  }

  @Post('reset-swipes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清空滑卡记录（演示/联调）' })
  @ApiResponse({ status: 200, description: '已清空' })
  async resetSwipeHistory(@CurrentUser('id') userId: string) {
    return this.matchesService.resetSwipeHistory(userId);
  }
}
