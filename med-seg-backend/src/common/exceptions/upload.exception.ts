import { HttpException, HttpStatus } from '@nestjs/common';

export class UploadException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        details,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
