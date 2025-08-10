// zones.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm'; // <- add In
import { LocationZone } from './entities/location-zone.entity';
import { OcsService } from 'src/ocs/ocs.service';

interface OcsZoneOperator {
  countryIso2: string;
  countryName: string;
}
interface OcsLocationZone {
  zoneId: number;
  zoneName: string;
  operators?: OcsZoneOperator[];
}

@Injectable()
export class LocationZoneService {
  constructor(
    @InjectRepository(LocationZone)
    private readonly zoneRepo: Repository<LocationZone>,
    private readonly ocs: OcsService,
  ) {}

  // NEW: used by PackageTemplatesService
  async findManyByIds(zoneIds: string[]) {
    if (!zoneIds.length) return [];
    return this.zoneRepo.find({
      where: { zoneId: In(zoneIds) }, // import In from 'typeorm'
    });
  }

  async syncFromOcs(resellerId: number): Promise<{ saved: number }> {
    if (!resellerId) throw new BadRequestException('resellerId is required');

    const payload = { listDetailedLocationZone: resellerId };
    const res = await this.ocs.post<{
      listDetailedLocationZone: OcsLocationZone[] | null;
    }>(payload);

    const zones: OcsLocationZone[] = res.listDetailedLocationZone ?? [];
    if (!zones.length) return { saved: 0 };

    const rows: Partial<LocationZone>[] = zones.map((z) => ({
      zoneId: String(z.zoneId),
      zoneName: z.zoneName,
      countriesIso2: (z.operators ?? []).map((o) => o.countryIso2),
      countryNames: (z.operators ?? []).map((o) => o.countryName),
    }));

    await this.zoneRepo.upsert(rows, { conflictPaths: ['zoneId'] });
    return { saved: rows.length };
  }
}
