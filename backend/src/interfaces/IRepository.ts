
export interface IRepository<T> {
  buscarPorId(id: number): Promise<T | null>;
  listar(): Promise<T[]>;
  criar(dados: T): Promise<number>;
  atualizar(id: number, dados: T): Promise<boolean>;
  excluir(id: number): Promise<boolean>;
}
