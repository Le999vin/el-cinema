import "@/lib/load-env";

import { syncSeries } from "@/services/external/sync";

syncSeries()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
