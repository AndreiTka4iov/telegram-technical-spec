import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ErrorHandlingService {
  throwError(code: number, message: string) {
    throw new HttpException(
      {
        statusCode: code,
        errorMessage: message,
        timestamp: new Date().toISOString(),
      },
      code,
    );
  }
}
