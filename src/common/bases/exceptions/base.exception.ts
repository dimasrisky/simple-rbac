import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseErrorResponse, BaseExceptionResponse } from '../base.response';

function toCamelCase(str: string): string {
  if (typeof str !== 'string') {
    str = '';
  }

  // Remove leading/trailing whitespace and convert to lowercase
  str = str.trim().toLowerCase();

  // Replace any space followed by a letter with the uppercase version of the letter
  return str.replace(/s+(.)/g, (match, group1: string): string =>
    group1.toUpperCase(),
  );
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Set the status code.
    const isHttpException = exception instanceof HttpException;
    let status: number = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    // Set the message to be displayed in the response.
    let message = isHttpException
      ? exception.getResponse()
      : new BaseExceptionResponse(
          'internalServerError',
          'Server error occurred.',
        );
    // Set the error detail to be displayed in the log.
    let errorDetails: string;
    errorDetails = isHttpException
      ? JSON.stringify(exception.getResponse())
      : '';

    console.log(errorDetails);

    const isObject = typeof message === 'object';
    let isBaseExceptionFormat: boolean =
      message instanceof BaseExceptionResponse;

    if (!isBaseExceptionFormat) {
      if (Array.isArray(message)) {
        isBaseExceptionFormat = message[0] instanceof BaseExceptionResponse;
      } else {
        if (isObject) {
          message = new BaseExceptionResponse(
            toCamelCase(
              (message as Record<string, unknown>)['error'] as string,
            ),
            (message as Record<string, unknown>)['message'] as string,
          );

          errorDetails = JSON.stringify(message);
          isBaseExceptionFormat = true;
        }
      }
    }

    // Check if the message is an object and not an instance of BaseExceptionResponse
    // If true then it will be recognized as an internal server error because the message is non standard.
    if (isObject && !isBaseExceptionFormat) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorDetails = 'Standard error exception is not implemented correctly.';
      message = new BaseExceptionResponse(
        'internalServerError',
        'Server error occurred.',
      );
    }

    let type: string;
    switch (status) {
      case 400:
        type = 'validationError';
        break;
      case 500:
        type = 'serverError';
        if (!errorDetails) {
          errorDetails = exception instanceof Error ? exception.message : '';
        }
        break;
      default:
        type = 'clientError';
    }

    // Write log here ...
    console.log(errorDetails);

    const result = new BaseErrorResponse(
      type,
      Array.isArray(message) ? message : [message],
      request.method + ' ' + request.url,
    );

    response.status(status).json(result);
  }
}
