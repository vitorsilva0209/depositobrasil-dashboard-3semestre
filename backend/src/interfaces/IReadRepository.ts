export interface IReadRepository<T> {
  buscarPorId(id: number): Promise<T | null>;
  listar(): Promise<T[]>;
}