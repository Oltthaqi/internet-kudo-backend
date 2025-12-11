import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The first name',
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  first_name: string;

  @ApiProperty({
    description: 'The last name',
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  last_name: string;

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
