import { IJornadasAll } from "./Jornada";

export type IVaga = {
  id: number;
  attributes: {
    name: string;
    description: string;
    shortDescription: string;
    jornadas?: IJornadasAll;
  };
};

export type IVagaFindOne = {
  data: IVaga;
};

export type IVagasAll = {
  data: IVaga[];
};
