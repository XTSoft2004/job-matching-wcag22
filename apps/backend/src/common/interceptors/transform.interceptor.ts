import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseHttp } from '../utils/response.util';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // If data is already fully wrapped in ResponseHttp, return as-is
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data
        ) {
          return data;
        }

        // If data is format for pagination: { data: T[], total: number, page: number, limit: number, message?: string }
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          Array.isArray(data.data) &&
          'total' in data &&
          'page' in data &&
          'limit' in data
        ) {
          const limit = data.limit || 10;
          return ResponseHttp.success({
            message: data.message || 'Success',
            data: data.data,
            meta: {
              itemsPerPage: limit,
              totalItems: data.total,
              currentPage: data.page || 1,
              totalPages: Math.ceil(data.total / limit),
            },
            statusCode,
          });
        }

        // Otherwise, wrap standard success response
        return ResponseHttp.success({
          message: 'Success',
          data: data === undefined ? null : data,
          statusCode,
        });
      }),
    );
  }
}
