import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtRolesGuard } from '../auth/utils/jwt‑roles.guard';
import { Roles } from '../auth/utils/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { OrdersService } from '../orders/orders.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    uuid: string;
    id?: string;
    role: Role;
    email: string;
  };
}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(AuthGuard('jwt'), JwtRolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @ApiOperation({ summary: 'Create payment intent for order' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    schema: {
      type: 'object',
      properties: {
        clientSecret: { type: 'string' },
        paymentIntentId: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  })
  @Post('create-intent')
  @Roles(Role.USER, Role.ADMIN)
  async createPaymentIntent(
    @Request() req: AuthenticatedRequest,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const userId = req.user.uuid || req.user.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    // Verify the order belongs to the user
    const order = await this.ordersService.findOne(
      createPaymentIntentDto.orderId,
    );
    if (order.userId !== userId) {
      throw new BadRequestException(
        'Order does not belong to the authenticated user',
      );
    }

    // Create payment intent
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency,
      {
        orderId: createPaymentIntentDto.orderId,
        userId: userId,
        packageTemplateId: order.packageTemplateId,
      },
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency,
    };
  }

  @ApiOperation({ summary: 'Confirm payment and process eSIM order' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed and order processed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        paymentStatus: { type: 'string' },
        order: { type: 'object' },
      },
    },
  })
  @Post('confirm')
  @Roles(Role.USER, Role.ADMIN)
  async confirmPayment(
    @Request() req: AuthenticatedRequest,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    const userId = req.user.uuid || req.user.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    // Get payment intent to verify
    const paymentIntent = await this.paymentsService.getPaymentIntent(
      confirmPaymentDto.paymentIntentId,
    );

    // Verify the payment belongs to the user
    if (paymentIntent.metadata.userId !== userId) {
      throw new BadRequestException(
        'Payment does not belong to the authenticated user',
      );
    }

    // Check if payment is successful
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(
        `Payment status is ${paymentIntent.status}, expected succeeded`,
      );
    }

    // Get the order and process it (trigger eSIM purchase or top-up)
    const orderId = paymentIntent.metadata.orderId;
    const order = await this.ordersService.findOne(orderId);

    // Process based on order type
    if (order.orderType === 'topup') {
      // Update order status to processing and trigger top-up
      await this.ordersService.processTopup(orderId);
    } else {
      // Update order status to processing and trigger eSIM purchase
      await this.ordersService.processOrderAfterPayment(orderId);
    }

    const updatedOrder = await this.ordersService.findOne(orderId);

    return {
      success: true,
      paymentStatus: paymentIntent.status,
      order: updatedOrder,
    };
  }

  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody?.toString() || '';

    try {
      const event = this.paymentsService.validateWebhookSignature(
        payload,
        signature,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          console.log('Payment succeeded:', event.data.object);
          break;
        case 'payment_intent.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }
}
