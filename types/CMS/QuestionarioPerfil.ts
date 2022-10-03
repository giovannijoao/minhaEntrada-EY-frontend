import { IPerfilUsuariosAll } from "./PerfilUsuario";

export type IQuestionarioPerfil = {
  id: number;
  attributes: {
    questions: {
      id: number;
      text: string;
      answers: {
        id: number;
        text: string;
        perfil_usuarios: IPerfilUsuariosAll
      }[]
    }[];
  };
};

export type IQuestionarioPerfilFindOne = {
  data: IQuestionarioPerfil;
};
