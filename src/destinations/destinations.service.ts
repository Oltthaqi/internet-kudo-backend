import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageTemplate } from '../package-template/entities/package-template.entity';
import { LocationZone } from '../location-zone/entities/location-zone.entity';

// type ZoneLite = {
//   ZoneId: number;
//   zoneName: string | null;
//   countriesIso2: string[];
// };

// type PkgLite = {
//   id: string;
//   name: string;
//   price: number | null;
//   zoneId: number;
// };

@Injectable()
export class DestinationsService {
  constructor(
    @InjectRepository(PackageTemplate)
    private packageTemplateRepo: Repository<PackageTemplate>,
    @InjectRepository(LocationZone)
    private locationZoneRepo: Repository<LocationZone>,
  ) {}

  async getDestinations() {
    const zones = await this.locationZoneRepo.find({
      select: ['id', 'zoneName', 'countriesIso2', 'countryNames'],
    });

    return (
      zones
        // Skip zones with empty or null countriesIso2
        .filter(
          (zone) =>
            Array.isArray(zone.countriesIso2) && zone.countriesIso2.length > 0,
        )
        .map((zone) => {
          const uniqueIso2 = [...new Set(zone.countriesIso2)];
          const uniqueNames = [...new Set(zone.countryNames)];

          let type: 'local' | 'regional' | 'global';
          if (zone.zoneName.toLowerCase().includes('kuda')) {
            type = 'global';
          } else if (uniqueIso2.length === 1) {
            type = 'local';
          } else {
            type = 'regional';
          }

          return {
            key: zone.id,
            title: zone.zoneName,
            countries: uniqueNames,
            iso2: uniqueIso2,
            type,
          };
        })
    );
  }
}
