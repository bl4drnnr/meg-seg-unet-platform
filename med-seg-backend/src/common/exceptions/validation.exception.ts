import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        details,
        statusCode: HttpStatus.BAD_REQUEST
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
