// Inspired by the ParseIntPipe spec
// (https://github.com/nestjs/nest/blob/master/packages/common/test/pipes/parse-int.pipe.spec.ts)
import { ArgumentMetadata, HttpException } from '@nestjs/common';
import { ParseFloatPipe } from './parse-float.pipe';

class CustomTestError extends HttpException {
  constructor() {
    super('This is a TestException', 418);
  }
}

describe('ParseFloatPipe', () => {
  let target: ParseFloatPipe;
  beforeEach(() => {
    target = new ParseFloatPipe({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exceptionFactory: (error: any) => new CustomTestError(),
    });
  });
  describe('transform', () => {
    describe('when validation passes', () => {
      it('should return number for an int', async () => {
        const num = '3';
        expect(await target.transform(num, {} as ArgumentMetadata)).toEqual(3);
      });

      it('should return number for a float', async () => {
        const num = '3.14';
        expect(await target.transform(num, {} as ArgumentMetadata)).toEqual(3.14);
      });

      it('should return number for a negative number', async () => {
        const num = '-2.56';
        expect(await target.transform(num, {} as ArgumentMetadata)).toEqual(-2.56);
      });
    });
    describe('when validation fails', () => {
      it('should throw an error', async () => {
        await expect(() => target.transform('123abc', {} as ArgumentMetadata)).rejects.toThrowError(
          CustomTestError,
        );
      });
    });
  });
});
