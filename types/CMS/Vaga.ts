import { IConhecimentosAll } from "./Conhecimento";
import { IJornadasAll } from "./Jornada";

export type IVaga = {
  id: number;
  attributes: {
    name: string;
    description: string;
    shortDescription: string;
    jornadas?: IJornadasAll;
    conhecimentos?: IConhecimentosAll;
  };
};

export type IVagaFindOne = {
  data: IVaga;
};

export type IVagasAll = {
  data: IVaga[];
};
