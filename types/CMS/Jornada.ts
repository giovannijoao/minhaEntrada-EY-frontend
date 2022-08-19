import { IImageFindOne } from "./IImageFormat";
import { ITrilhasAll } from "./Trilha";

export type IJornada = {
  id: number;
  attributes: {
    name: string;
    description: string;
    image: IImageFindOne;
    trilhas?: ITrilhasAll
  };
};

export type IJornadaFindOne = {
  data: IJornada
}

export type IJornadasAll = {
  data: IJornada[]
}
