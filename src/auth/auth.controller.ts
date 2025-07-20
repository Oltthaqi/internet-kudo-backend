import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyUserDto } from './dto/verify-user.dto';
import LoginUserDto from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { UsersService } from 'src/users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersEntity } from 'src/users/entitites/users.entity';
import { JwtRolesGuard } from './utils/jwt‑roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { GoogleAuthGuard } from './utils/google-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() userDto: CreateUserDto): Promise<UsersEntity> {
    return await this.authService.signUp(userDto);
  }

  @Patch('verify/:user_id')
  async verifyUser(
    @Param('user_id') user_id: string,
    @Body() verifyUserDto: VerifyUserDto,
  ): Promise<boolean> {
    return await this.authService.verifyUser(user_id, verifyUserDto);
  }

  @Post('resend-code')
  async resendUserCode(@Body() resendCodeDto: ResendCodeDto): Promise<string> {
    return await this.authService.resendUserCode(resendCodeDto);
  }

  @Post('login')
  async login(@Body() userDto: LoginUserDto): Promise<object> {
    return await this.authService.login(userDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto): Promise<object> {
    return await this.authService.forgotPassword(data);
  }

  @Post('reset-password/:user_id')
  async resetPassword(
    @Param('user_id') user_id: string,
    @Body() data: ResetPasswordDto,
  ): Promise<boolean> {
    return await this.authService.resetPassword(user_id, data);
  }

  @UseGuards(JwtRolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Post('change-password/:user_id')
  async changePassword(
    @Param('user_id') user_id: string,
    @Body() data: ChangePasswordDto,
  ): Promise<boolean> {
    return await this.authService.changePassword(user_id, data);
  }

  @Post('refresh-token')
  async refreshToken(@Body() data: RefreshTokenDto): Promise<object> {
    const { refreshToken } = data;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);

    if (typeof payload !== 'object' || !('sub' in payload)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.getUserById(payload.sub as string);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.authService.getSessionTokens(user);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin(): Promise<void> {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleLoginCallback(@Req() req: Request): Promise<object> {
    const user = req.user as UsersEntity;

    return await this.authService.loginGoogle(user);
  }
}
