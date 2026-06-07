import dotenv from "dotenv";
import { connectDatabase } from "./config/database.js";
import { seedSuperAdmin } from "./utils/seedSuperAdmin.js";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

async function bootstrap() {
  const { default: app } = await import("./app.js");

  await connectDatabase();
  await seedSuperAdmin();

  app.listen(port, () => {
    console.log(`SmartTask API running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start SmartTask API", error);
  process.exit(1);
});
