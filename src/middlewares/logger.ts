import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RouteLogger');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const path = originalUrl.substring(4); // remove `/api` prefix
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || '0';

      const logString = `${method} ${path} ${statusCode} ${contentLength} - ${userAgent} ${ip}`;
      if (statusCode >= 400 && statusCode < 500) this.logger.warn(logString);
      else if (statusCode > 500) this.logger.error(logString);
      else this.logger.log(logString);
    });

    next();
  }
}
