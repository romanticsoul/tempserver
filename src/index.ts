import { fetchMedia, upsertMedia } from "./api/fetchMedia";

async function start() {
  for (let i = 0; i < 1; i++) {
    const { docs } = await fetchMedia({
      page: 1,
      limit: 1,
    });
    console.log("Данные получены");

    const a = await upsertMedia(docs[0]);
    console.log(a, "Успех");
  }
}

start();
