import { BadRequestException, Controller, Post, Query } from '@nestjs/common';
import { LocationZoneService } from './location-zone.service';

@Controller('zones')
export class LocationZoneController {
  constructor(private readonly zones: LocationZoneService) {}
  @Post('sync')
  async sync(@Query('resellerId') resellerId?: string) {
    const id = Number(resellerId);
    if (!id) throw new BadRequestException('resellerId is required');
    return this.zones.syncFromOcs(id);
  }
}
