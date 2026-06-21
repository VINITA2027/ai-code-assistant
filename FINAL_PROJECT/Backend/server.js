import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(express.json({ limit: "1mb" }));
app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true
}));

app.get("/", (req, res) => {
    return res.json({
        status: "running",
        service: "AI Code Assistant API"
    });
});

app.get("/health", (req, res) => {
    return res.status(200).json({ status: "ok" });
});

app.use("/api", chatRoutes);

const connectDB = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error("Missing MongoDB connection string. Set MONGODB_URI.");
        }

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Mongo Error:", err);
        process.exit(1);
    }
};

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
};

startServer().catch(err => {
    console.error("Server failed to start", err);
    process.exit(1);
});