import { syncNowPlayingMovies } from "../src/lib/movies";

async function main() {
  const result = await syncNowPlayingMovies();

  console.log(
    JSON.stringify(
      {
        status: result.status,
        city: result.cityName,
        movies: result.sourceCount,
        finishedAt: result.finishedAt,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
