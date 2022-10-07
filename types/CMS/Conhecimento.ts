export type IConhecimento = {
  id: number;
  attributes: {
    name: string;
  };
};

export type IConhecimentoFindOne = {
  data: IConhecimento
}

export type IConhecimentosAll = {
  data: IConhecimento[]
}
