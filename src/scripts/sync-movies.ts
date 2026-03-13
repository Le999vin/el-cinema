import "@/lib/load-env";

import { syncMovies } from "@/services/external/sync";

syncMovies()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
