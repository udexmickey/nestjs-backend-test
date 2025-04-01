import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
// import { GraphQLError } from 'graphql';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlContext = host.getType<'graphql'>() === 'graphql';
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Ensure exception is an HttpException; otherwise, wrap it in a 500 error
    const httpException =
      exception instanceof HttpException
        ? exception
        : new InternalServerErrorException('Internal Server Error');

    const status =
      httpException.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage = httpException.message || 'Internal Server Error';

    // ✅ Handle GraphQL errors by throwing them
    if (gqlContext) {
      //   return new GraphQLError(errorMessage, {
      //     extensions: {
      //       message: httpException.message,
      //       statusCode: status,
      //       code: httpException.name,
      //     },
      //   });
      throw httpException;
    }

    // ✅ Handle REST API errors
    // Handle REST response (for consistency)
    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined,
    });
  }
}
