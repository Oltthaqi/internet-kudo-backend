import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateInviteDto {
  @ApiProperty({
    description: 'The email',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
