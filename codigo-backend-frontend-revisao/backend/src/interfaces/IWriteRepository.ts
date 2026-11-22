export interface IWriteRepository<T> {
  criar(dados: T): Promise<number>;
  atualizar(id: number, dados: T): Promise<boolean>;
  excluir(id: number): Promise<boolean>;
}