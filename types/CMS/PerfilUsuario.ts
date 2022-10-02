export type IPerfilUsuario = {
  id: number;
  attributes: {
    name: string;
  };
};

export type IPerfilUsuarioFindOne = {
  data: IPerfilUsuario
}

export type IPerfilUsuariosAll = {
  data: IPerfilUsuario[]
}
