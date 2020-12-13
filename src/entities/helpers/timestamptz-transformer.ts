import { ValueTransformer } from 'typeorm';

export class ColumnTimestampTzTransformer implements ValueTransformer {
  to(data: string | null): string | null {
    return data;
  }

  from(data?: Date | null): string | null {
    if (!data) return null;
    return data.toISOString();
  }
}
