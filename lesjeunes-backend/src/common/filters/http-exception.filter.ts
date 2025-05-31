// common/filters/http-exception.filter.ts - Global Error Handling
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // Catch all exceptions
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Determine status code and message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle validation errors (class-validator)
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse['message']
      ) {
        message = exceptionResponse['message'];
      } else {
        message = exceptionResponse as string;
      }
    }

    // Consistent error response format
    const errorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message], // Always array
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    };

    response.status(status).json(errorResponse);
  }
}
