import "dotenv/config";

import { syncCinemas } from "@/services/external/sync";

syncCinemas()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

