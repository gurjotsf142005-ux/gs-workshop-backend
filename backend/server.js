require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

const { connectDB } = require("./config/db");
const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads"), {
  maxAge: "30d",
  etag: true,
}));

app.use("/api", routes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();