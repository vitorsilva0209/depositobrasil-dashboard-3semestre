import type { IReadRepository } from "./IReadRepository";
import type { IWriteRepository } from "./IWriteRepository";

export interface IRepository<T>
  extends IReadRepository<T>, IWriteRepository<T> {}