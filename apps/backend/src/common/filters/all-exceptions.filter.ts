import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHttp } from '../utils/response.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorResponseDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        errorResponseDetails = res;
        // Standard ValidationPipe output is { message: string[], error: string }
        message = (res as any).message || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the exception details
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${
        exception instanceof Error
          ? exception.message
          : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorResponse = ResponseHttp.error({
      message,
      statusCode: status as any,
    });

    response.status(status).json(errorResponse);
  }
}
