import "@/lib/load-env";

import { syncCatalog } from "@/services/external/sync";

syncCatalog()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
