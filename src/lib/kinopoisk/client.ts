import { Api } from "./generated";

export type { MovieDtoV14 } from "./generated";

const kinopoiskApi = new Api({
  baseUrl: "https://api.kinopoisk.dev",
  baseApiParams: {
    headers: {
      "X-API-KEY": process.env.OPENMOVIE_API_KEY!,
    },
  },
});

export const { movieControllerFindManyByQueryV14 } = kinopoiskApi.v14;
