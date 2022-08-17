import { IAtividadeFindOne } from "./Atividade";

export type IAula = {
  id: number;
  attributes: {
    name: string;
    description: string;
    duration: string;
    url: string;
    atividade?: IAtividadeFindOne
  };
};

export type IAulaFindOne = {
  data: IAula;
};

export type IAulasAll = {
  data: IAula[];
};
