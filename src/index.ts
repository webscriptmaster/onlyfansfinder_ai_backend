import cors from "cors";
import express from "express";
import path from "path";

import defaultConfig from "./config/default.config";
import connectDB from "./services/db.service";
import routes from "./routes";

const app = express();

// Cors configuration
const allowedOrigins = [
  "https://onlyfansfinder-ai.vercel.app",
  "https://www.onlyswiper.com",
  "https://onlyswiper.com",
  defaultConfig.app.frontend
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    credentials: true
  })
);

// Parse request of content type
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(
  "/static",
  express.static(path.join(__dirname, "..", path.sep, "static"))
);

// Use routes
app.use(routes);

// Connect to database
connectDB()
  .then(() => {
    console.info("Database connected successfully.");

    const PORT = defaultConfig.app.port;
    app.listen(PORT, () => {
      console.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed. error: ", error);
    process.exit();
  });

// Error handler
process.on("unhandledRejection", (error) => {
  console.error("Unknown error occurred: ", error);
  process.exit(1);
});
