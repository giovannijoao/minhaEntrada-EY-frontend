
export type IAula = {
  id: number;
  attributes: {
    name: string;
    description: string;
    duration: string;
    url: string;
  };
};

export type IAulaFindOne = {
  data: IAula;
};

export type IAulasAll = {
  data: IAula[];
};
