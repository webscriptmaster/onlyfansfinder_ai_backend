import dotenv from "dotenv";

import connectDB from "../services/db.service";
import creatorSeeder from "./creator.seeder";

dotenv.config();

connectDB()
  .then(async () => {
    console.info("Database connected successfully.");

    await creatorSeeder();
    console.info("Users seeded successfully.");

    process.exit();
  })
  .catch((error: Error) => {
    console.error("Database connection failed. error: ", error);
    process.exit();
  });
