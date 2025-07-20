import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'The name of the company',
    example: 'Full-Time',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The information of the company',
    example: 'This is a sample company.',
  })
  @IsString()
  @IsOptional()
  information: string;

  @ApiProperty({
    description: 'The locations of the company',
    example: '["Prishtine", "Mitrovice"]',
    type: 'string',
  })
  @Transform(({ value }) => {
    try {
      if (typeof value === 'string') {
        // Try JSON parse first
        try {
          return JSON.parse(value) as string[];
        } catch {
          // If JSON.parse fails, fall back to comma split
          return value.split(',').map((v) => v.trim());
        }
      }
      return Array.isArray(value) && value.every((v) => typeof v === 'string')
        ? value
        : [];
    } catch {
      return [];
    }
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locations: string[];

  @ApiProperty({
    description: 'The phone number of the company',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone_number: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'The owner (user) ID',
    example: '0016946d-181c-4dba-b2ad-7f67e488554e',
    required: false,
  })
  user_id?: string;
}
