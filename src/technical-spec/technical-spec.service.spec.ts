import { Test, TestingModule } from '@nestjs/testing';
import { TechnicalSpecService } from './technical-spec.service';

describe('TechnicalSpecService', () => {
  let service: TechnicalSpecService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TechnicalSpecService],
    }).compile();

    service = module.get<TechnicalSpecService>(TechnicalSpecService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
