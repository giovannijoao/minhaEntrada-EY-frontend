import { IImage, IImageFindOne } from "./IImageFormat";
import { ITrilhaFindOne } from "./Trilha";

export type IEmblema = {
  id: number;
  attributes: {
    name: string;
    image: IImageFindOne
    trilha?: ITrilhaFindOne
  };
};

export type IEmblemaFindOne = {
  data: IEmblema;
};

export type IEmblemasAll = {
  data: IEmblema[];
};
