import {
  Controller,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
  Req,
  Param,
  Body,
  UploadedFile,
  ForbiddenException,
  NotFoundException,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserEntity } from './entity/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 사용자 프로필 조회
  @Get('/:userId')
  async getProfile(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return {
      users_id: user.id,
      nickname: user.nickname,
      profile_image: user.profileImage,
      created_at: user.createdAt,
    };
  }

  // 사용자 프로필 업데이트
  @Put('/:userId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('profile_image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('지원되지 않는 이미지 형식입니다.'), false);
        }
      },
    }),
  )
  async updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request & { user: UserEntity },
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (req.user.id !== userId) {
      throw new ForbiddenException('본인만 프로필을 수정할 수 있습니다.');
    }

    const updatedUser = await this.usersService.updateUser(userId, updateUserDto, file);

    return {
      users_id: updatedUser.id,
      nickname: updatedUser.nickname,
      profile_image: updatedUser.profileImage,
      created_at: updatedUser.createdAt,
    };
  }
}
