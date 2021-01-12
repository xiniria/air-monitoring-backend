// Custom float-parsing pipe for request parameters
// See the docs at https://docs.nestjs.com/pipes#custom-pipes
// Inspired by the ParseIntPipe
// (https://github.com/nestjs/nest/blob/master/packages/common/pipes/parse-int.pipe.ts)
import { ArgumentMetadata, HttpStatus, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { ErrorHttpStatusCode, HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

export interface ParseFloatPipeOptions {
  errorHttpStatusCode?: ErrorHttpStatusCode;
  exceptionFactory?: (error: string) => any;
}

/**
 * Defines the ParseFloat Pipe
 */
@Injectable()
export class ParseFloatPipe implements PipeTransform<string> {
  protected exceptionFactory: (error: string) => any;

  constructor(@Optional() options?: ParseFloatPipeOptions) {
    options = options || {};
    const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } = options;

    this.exceptionFactory =
      exceptionFactory || ((error) => new HttpErrorByCode[errorHttpStatusCode](error));
  }

  /**
   * Method that accesses and performs optional transformation on argument for
   * in-flight requests.
   *
   * @param value currently processed route argument
   * @param metadata contains metadata about the currently processed route argument
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    const isNumeric =
      ['string', 'number'].includes(typeof value) &&
      !Number.isNaN(Number(value)) &&
      isFinite(value as any);
    if (!isNumeric) {
      throw this.exceptionFactory('Validation failed (numeric string is expected)');
    }
    // we don't use the built-in function parseFloat because it is not restrictive enough:
    // parseFloat('123abc') === 123 but Number('123abc') === NaN
    return Number(value);
  }
}
