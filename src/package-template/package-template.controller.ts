import { BadRequestException, Controller, Post, Query } from '@nestjs/common';
import { PackageTemplatesService } from './package-template.service';

@Controller('api/packages')
export class PackageTemplatesController {
  constructor(private readonly svc: PackageTemplatesService) {}

  @Post('sync')
  sync(@Query('resellerId') resellerId?: string) {
    const id = Number(resellerId);
    if (!id) throw new BadRequestException('resellerId is required');
    return this.svc.syncFromOcs(id);
  }
}
