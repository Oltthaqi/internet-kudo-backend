import { Controller, Get } from '@nestjs/common';
import { DestinationsService } from './destinations.service';

@Controller('api/esim/destinations')
export class DestinationsController {
  constructor(private readonly svc: DestinationsService) {}

  // Lokale: list countries from single-country zones
  // GET /api/esim/destinations/lokale?resellerId=567
  @Get()
  lokale() {
    return this.svc.getDestinations();
  }
}
