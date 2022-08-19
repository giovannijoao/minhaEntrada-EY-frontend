import { IImage, IImageFindOne } from "./IImageFormat";

export type IEmblema = {
  id: number;
  attributes: {
    name: string;
    image: IImageFindOne
  };
};

export type IEmblemaFindOne = {
  data: IEmblema;
};

export type IEmblemasAll = {
  data: IEmblema[];
};
