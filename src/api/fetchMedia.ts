import {
  movieControllerFindManyByQueryV14,
  type MovieDtoV14,
} from "../lib/kinopoisk/client";
import { prisma } from "../lib/prisma";
import type { Media, MediaType, Status } from "@prisma/client";

type Params = Parameters<typeof movieControllerFindManyByQueryV14>[0];
type Return = Awaited<
  ReturnType<typeof movieControllerFindManyByQueryV14>
>["data"];

const DEFAULT_PARAMS: Params = {
  page: 1,
  limit: 250,
  selectFields: [
    "id",
    "externalId",
    "name",
    "description",
    "shortDescription",
    "slogan",
    "type",
    "isSeries",
    "status",
    "year",
    "rating",
    "ageRating",
    "votes",
    "seasonsInfo",
    "movieLength",
    "seriesLength",
    "genres",
    "countries",
    "poster",
    "backdrop",
    "logo",
    "persons",
    "top10",
    "top250",
    "updatedAt",
    "createdAt",
  ],
  notNullFields: [
    "name",
    "year",
    "type",
    "rating.kp",
    "genres.name",
    "countries.name",
    "poster.url",
    "description",
  ],
  sortField: ["updatedAt", "createdAt", "year"],
  sortType: ["-1", "-1", "-1"],
  "rating.kp": ["1-10"],
  "rating.imdb": ["1-10"],
};

export async function fetchMedia(params: Params): Promise<Return> {
  try {
    const response = await movieControllerFindManyByQueryV14(
      {
        ...DEFAULT_PARAMS,
        ...params,
      },
      {
        cache: "force-cache",
      }
    );
    if (!response.ok) {
      console.log("Повторная попытка, повтор...", response.statusText);
      return fetchMedia(params);
    }
    return response.data;
  } catch (error) {
    console.log("Произошла ошибка, повтор...", error);
    return fetchMedia(params);
  }
}

export async function upsertMedia(media: MovieDtoV14) {
  const data = mapMovieDtoV14ToMedia(media);

  await prisma.media.upsert({
    where: { kp_id: media.id! },
    create: {
      ...data,
      genres: {
        connectOrCreate: media.genres!.map((g) => ({
          where: { name: g.name! },
          create: { name: g.name! },
        })),
      },
      countries: {
        connectOrCreate: media.countries!.map((c) => ({
          where: { name: c.name! },
          create: { name: c.name! },
        })),
      },

      // persons: {
      //   create:
      //     media.persons!.map((p) => ({
      //       profession: p.profession || null,
      //       description: p.description || null,

      //       person: {
      //         connectOrCreate: {
      //           where: { id: p.id },
      //           create: {
      //             id: p.id,
      //             name: p.name || p.enName || "Неизвестный",
      //             photo: p.photo || null,
      //           },
      //         },
      //       },
      //     })) || [],
      // },
    },
    update: {
      ...data,
      genres: {
        set: [], // Очистить текущие связи и заново привязать
        connectOrCreate: media.genres!.map((g) => ({
          where: { name: g.name! },
          create: { name: g.name! },
        })),
      },
      countries: {
        set: [],
        connectOrCreate: media.countries!.map((c) => ({
          where: { name: c.name! },
          create: { name: c.name! },
        })),
      },
      // persons: {
      //   deleteMany: {}, // удалить все старые связи и пересоздать
      //   create:
      //     media.persons!.map((p) => ({
      //       profession: p.profession || null,
      //       description: p.description || null,
      //       person: {
      //         connectOrCreate: {
      //           where: { id: p.id },
      //           create: {
      //             id: p.id,
      //             name: p.name || p.enName || "Неизвестный",
      //             photo: p.photo || null,
      //           },
      //         },
      //       },
      //     })) || [],
      // },
    },
  });
}

export async function createManyMedia(params: Return["docs"]) {
  const s = await prisma.media.createMany({
    data: params.map((m) => ({ ...mapMovieDtoV14ToMedia(m) })),
  });
}

function mapMovieDtoV14ToMedia(movie: MovieDtoV14): Media {
  return {
    kp_id: movie.id!,
    imdb_id: movie.externalId?.imdb || null,
    tmdb_id: movie.externalId?.tmdb || null,
    title: movie.name!,
    description: movie.description!,
    short_description: movie.shortDescription || null,
    slogan: movie.slogan || null,
    type: movie.type as MediaType,
    is_series: movie.isSeries || null,
    status: movie.status as Status | null,
    year: movie.year!,
    rating_kp: movie.rating?.kp!,
    rating_age: movie.ageRating || null,
    rating_imdb: movie.rating?.imdb || null,
    rating_tmdb: movie.rating?.tmdb || null,
    votes_kp: Number(movie.votes?.kp) || 0,
    votes_imdb: movie.votes?.imdb || null,
    votes_tmdb: movie.votes?.tmdb || null,
    movie_length: movie.movieLength || null,
    poster: movie.poster?.url!,
    backdrop: movie.backdrop?.url || null,
    logo: movie.logo?.url || null,
    top_10: movie.top10 || null,
    top_250: movie.top250 || null,
    series_length: movie.seriesLength || null,
    updated_at: new Date(movie.updatedAt!),
    created_at: new Date(movie.updatedAt!),
  };
}
