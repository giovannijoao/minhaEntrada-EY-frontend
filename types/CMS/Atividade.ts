export type Answer = {
  id: number;
  text: string;
  isCorrect: boolean | null;
}

export type Question = {
  id: number;
  text: string;
  correctAnswers?: number;
  answers?: Answer[]
}

export type IAtividade = {
  id: number;
  attributes: {
    name: string;
    description: string;
    questions: Question[]
  };
};

export type IAtividadeFindOne = {
  data: IAtividade;
};

export type IAtividadesAll = {
  data: IAtividade[];
};
