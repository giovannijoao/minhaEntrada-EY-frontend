export type IImageFormat ={
  "name": string,
  "hash": string,
  "ext": string,
  "mime": string,
  "path": null,
  "width": number,
  "height": number,
  "size": number,
  "url": string
}

export type IImage = {
  id: number;
  attributes: {
    name: string;
    caption: string;
    formats: {
      thumbnail: IImageFormat;
      medium: IImageFormat;
      small: IImageFormat;
    };
  };
};

export type IImageFindOne = {
  data?: IImage
};