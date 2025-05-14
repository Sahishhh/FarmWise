import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import blogRouter from "./routes/blog.routes.js"
import messageRouter from "./routes/message.routes.js"
import expertRouter from "./routes/expert.route.js"
import bookingRouter from "./routes/booking.routes.js"

//routes declaration
app.use("/api/farmwise/users", userRouter)
app.use("/api/farmwise/blog", blogRouter)
app.use("/api/farmwise/messages", messageRouter)
app.use("/api/farmwise/expert",expertRouter )
app.use("/api/farmwise/booking",bookingRouter )

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: "Service is healthy!" });
});

app.get("/worldnews", async (req, res) => {
    try {
        const { language = 'en' } = req.query;

        // Simplified queries for each language
        const queries = {
            'en': {
                q: 'agriculture AND india',
                language: 'en',
            },
            'hi': {
                q: 'कृषि OR खेती OR किसान',
                language: 'hi',
            },
            'mr': {
                q: 'शेती OR कृषी OR शेतकरी',
                language: 'mr',
            }
        };

        const selectedQuery = queries[language] || queries['en'];

        const response = await axios.get(
            'https://newsapi.org/v2/everything',
            {
                params: {
                    ...selectedQuery,
                    pageSize: 30,
                    sortBy: 'publishedAt',
                    apiKey: process.env.NEWS_API
                }
            }
        );

        // Log the response for debugging
        console.log(`Fetched ${response.data.articles?.length} articles`);

        res.json(response.data);
    } catch (error) {
        console.error("News API Error Details:", {
            message: error.message,
            response: error.response?.data
        });
        res.status(500).json({
            status: "error",
            message: "Failed to fetch news",
            details: error.message
        });
    }
});

// Alternative endpoint using top-headlines
app.get("/indiannews", async (req, res) => {
    try {
        const { language = 'en' } = req.query;

        const response = await axios.get(
            'https://newsapi.org/v2/top-headlines',
            {
                params: {
                    country: 'in',
                    category: 'business',
                    language: language === 'en' ? 'en' : 'hi',
                    pageSize: 30,
                    apiKey: process.env.NEWS_API
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("News API Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch news"
        });
    }
});

export { app };
