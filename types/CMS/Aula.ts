import { IAtividadeFindOne } from "./Atividade";

export type IVideo = {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string;
      url: string;
    }
  }
}
type IAulaExtends = ({
  url: string
  video: null
} | {
  url: null,
  video: IVideo
});
export type IAula = {
  id: number;
  attributes: {
    name: string;
    description: string;
    duration: string;
    atividade?: IAtividadeFindOne
    createdAt: string;
  } & IAulaExtends;
};

export type IAulaFindOne = {
  data: IAula;
};

export type IAulasAll = {
  data: IAula[];
};
