import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    description: 'OCS Package Template ID to purchase',
    example: '234593',
  })
  @IsString()
  packageTemplateId: string;

  @ApiProperty({
    description: 'Type of order - one-time or recurring',
    enum: OrderType,
    example: OrderType.ONE_TIME,
  })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({
    description: 'Order amount',
    example: 1.0,
    type: 'number',
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description: 'Currency code (defaults to USD)',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  // Subscriber identification (all optional - system will auto-allocate if none provided)
  @ApiPropertyOptional({
    description: 'Subscriber ID for existing subscriber (optional)',
    example: 28345617,
    type: 'number',
  })
  @IsNumber()
  @IsOptional()
  subscriberId?: number;

  @ApiPropertyOptional({
    description: 'IMSI for subscriber identification (optional)',
    example: '123456789012345',
  })
  @IsString()
  @IsOptional()
  imsi?: string;

  @ApiPropertyOptional({
    description: 'ICCID for subscriber identification (optional)',
    example: '8948010000054019245',
  })
  @IsString()
  @IsOptional()
  iccid?: string;

  @ApiPropertyOptional({
    description:
      'MSISDN (phone number) for subscriber identification (optional)',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  msisdn?: string;

  @ApiPropertyOptional({
    description: 'Activation code for subscriber identification (optional)',
    example: 'K2-2KPOHA-9P0O2H',
  })
  @IsString()
  @IsOptional()
  activationCode?: string;

  // Package configuration (all optional - will use defaults)
  @ApiPropertyOptional({
    description: 'Validity period in days (optional - uses package default)',
    example: 7,
    minimum: 1,
    maximum: 365,
  })
  @IsNumber()
  @IsOptional()
  validityPeriod?: number;

  @ApiPropertyOptional({
    description: 'Start date and time for package activation (optional)',
    example: '2024-01-15T10:00:00Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  activePeriodStart?: string;

  @ApiPropertyOptional({
    description: 'End date and time for package expiration (optional)',
    example: '2024-02-15T10:00:00Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  activePeriodEnd?: string;

  // Recurring package specific fields
  @ApiPropertyOptional({
    description: 'Start time for recurring packages (UTC) (optional)',
    example: '2024-01-15T10:00:00Z',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  startTimeUTC?: string;

  @ApiPropertyOptional({
    description: 'Whether to activate package on first use (optional)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  activationAtFirstUse?: boolean;
}
