import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";

dotenv.config({ path: './config.env' });
const app = express();
app.use(express.json());
// Middleware
app.use(cors());

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
});

