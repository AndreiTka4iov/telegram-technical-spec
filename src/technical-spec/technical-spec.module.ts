import { Module } from '@nestjs/common';
import { TechnicalSpecService } from './technical-spec.service';

@Module({
  providers: [TechnicalSpecService],
  exports: [TechnicalSpecService],
})
export class TechnicalSpecModule {}
