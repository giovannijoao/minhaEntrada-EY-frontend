import { IJornadasAll } from "./Jornada";

export type IPerfilUsuario = {
  id: number;
  attributes: {
    name: string;
    jornadas: IJornadasAll
  };
};

export type IPerfilUsuarioFindOne = {
  data: IPerfilUsuario
}

export type IPerfilUsuariosAll = {
  data: IPerfilUsuario[]
}
