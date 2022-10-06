import { IImageFindOne } from "./IImageFormat";
import { ITrilhasAll } from "./Trilha";
import { IVagasAll } from "./Vaga";

export type IJornada = {
  id: number;
  attributes: {
    name: string;
    description: string;
    image: IImageFindOne;
    trilhas?: ITrilhasAll
    vagas?: IVagasAll
  };
  isSubmitting?: boolean;
};

export type IJornadaFindOne = {
  data: IJornada
}

export type IJornadasAll = {
  data: IJornada[]
}
