import { IImageFindOne } from "./IImageFormat";

export type IJornada = {
  id: number;
  attributes: {
    name: string;
    description: string;
    image: IImageFindOne;
  };
};

export type IJornadaFindOne = {
  data: IJornada
}

export type IJornadasAll = {
  data: IJornada[]
}
