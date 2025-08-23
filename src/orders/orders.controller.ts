import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { TopupOrderDto } from './dto/topup-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/utils/roles.decorator';
import { JwtRolesGuard } from '../auth/utils/jwt‑roles.guard';
import { Role } from '../users/enums/role.enum';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    uuid: string;
    id?: string;
    role: Role;
    email: string;
  };
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'), JwtRolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new eSIM order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Package template not found' })
  @Post()
  @Roles(Role.USER, Role.ADMIN)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const userId = req.user.uuid || req.user.id;

    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return this.ordersService.create(userId, createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({
    name: 'all',
    required: false,
    description: 'Admin only: get all orders from all users',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @Roles(Role.USER, Role.ADMIN)
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('all') all?: string,
  ): Promise<OrderResponseDto[]> {
    const userId =
      req.user.role === Role.ADMIN && all === 'true'
        ? undefined
        : req.user.uuid || req.user.id;
    return this.ordersService.findAll(userId);
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.ordersService.findOne(id);
    return this.ordersService['toResponseDto'](order);
  }

  @ApiOperation({ summary: 'Update order (Admin only)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Cancel order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed order' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Post(':id/cancel')
  @Roles(Role.USER, Role.ADMIN)
  async cancel(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.cancel(id);
  }

  @ApiOperation({ summary: 'Manually process order (Admin only)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order processing initiated',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Order processing initiated',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Post(':id/process')
  @Roles(Role.ADMIN)
  async processOrder(@Param('id') id: string): Promise<{ message: string }> {
    await this.ordersService.processOrder(id);
    return { message: 'Order processing initiated' };
  }

  @ApiOperation({ summary: 'Test OCS API connection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'OCS API test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @Post('test-ocs')
  @Roles(Role.USER)
  async testOcsConnection(): Promise<any> {
    return this.ordersService.testOcsConnection();
  }

  @ApiOperation({ summary: 'Create a top-up order for existing subscriber' })
  @ApiResponse({
    status: 201,
    description: 'Top-up order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Package template or subscriber not found',
  })
  @Post('topup')
  @Roles(Role.USER, Role.ADMIN)
  async createTopup(
    @Request() req: AuthenticatedRequest,
    @Body() topupOrderDto: TopupOrderDto,
  ): Promise<OrderResponseDto> {
    const userId = req.user.uuid || req.user.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }
    return this.ordersService.createTopup(userId, topupOrderDto);
  }

  @ApiOperation({ summary: 'Process top-up order (Admin only)' })
  @ApiParam({ name: 'id', description: 'Top-up order ID' })
  @ApiResponse({
    status: 200,
    description: 'Top-up processing initiated',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Top-up processing initiated',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order or not a top-up order',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Post(':id/topup-process')
  @Roles(Role.ADMIN)
  async processTopup(@Param('id') id: string) {
    await this.ordersService.processTopup(id);
    return { message: 'Top-up processing initiated' };
  }
}
