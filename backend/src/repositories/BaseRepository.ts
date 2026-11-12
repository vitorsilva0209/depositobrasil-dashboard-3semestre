
import { IRepository } from "../interfaces/IRepository";

export abstract class BaseRepository<T> implements IRepository<T> {
  abstract buscarPorId(id: number): Promise<T | null>;

  abstract listar(): Promise<T[]>;

  abstract criar(dados: T): Promise<number>;

  abstract atualizar(id: number, dados: T): Promise<boolean>;

  abstract excluir(id: number): Promise<boolean>;
}
