import { IImageFormat } from "./IImageFormat";

export type IJornada = {
  id: number;
  attributes: {
    name: string;
    description: string;
    image: {
      data: {
        id: number;
        attributes: {
          name: string;
          caption: string;
          formats: {
            thumbnail: IImageFormat
            medium: IImageFormat
            small: IImageFormat
          };
        };
      };
    };
  };
};

export type IJornadaFindOne = {
  data: IJornada
}

export type IJornadasAll = {
  data: IJornada[]
}
