import { IAulasAll } from "./Aula";
import { IEmblemaFindOne } from "./Emblema";
import { IImageFormat } from "./IImageFormat";
import { IJornadasAll } from "./Jornada";

export type ITrilha = {
  id: number;
  attributes: {
    name: string;
    description: string;
    color: string;
    jornadas?: IJornadasAll;
    aulas?: IAulasAll;
    emblema: IEmblemaFindOne
  };
};

export type ITrilhaFindOne = {
  data: ITrilha;
};

export type ITrilhasAll = {
  data: ITrilha[];
};
