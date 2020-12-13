import { Repository } from 'typeorm';

export type MockType<T> = {
  [P in keyof T]: jest.Mock;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const mockRepositoryFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
}));
