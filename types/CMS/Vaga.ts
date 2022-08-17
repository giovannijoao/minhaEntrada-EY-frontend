import { IJornadasAll } from "./Jornada";

export type IVaga = {
  id: number;
  attributes: {
    name: string;
    description: string;
    jornadas?: IJornadasAll;
  };
};

export type IVagaFindOne = {
  data: IVaga;
};

export type IVagasAll = {
  data: IVaga[];
};
