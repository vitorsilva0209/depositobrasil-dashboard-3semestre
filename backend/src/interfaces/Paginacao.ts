export interface ParametrosPaginacao {
  pagina: number;
  limite: number;
  busca: string;
}

export interface ResultadoPaginado<T> {
  dados: T[];
  total: number;
}

export interface IPaginacaoRepository<T> {
  listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<T>>;
}