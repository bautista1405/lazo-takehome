import { Injectable } from '@nestjs/common';

@Injectable()
export class ObligationService {

  getObligation(): string {
    return 'Hello World!';
  }

  createObligation(): string {
    return 'obligation created';
  }

  updateObligation(): string {
    return 'obligation updated';
  }

  deleteObligation(): string {
    return 'obligation deleted';
  }

  updateObligationStatus(): string {
    return 'obligation status updated';
  }
}
