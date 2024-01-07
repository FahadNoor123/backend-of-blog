import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGN || '*',
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import blogRouter from "./routes/blog.routes.js"


//routes declaration
app.use("/api/v1/users", userRouter)
// Use the blogRouter for blog-related routes under the /api/v1/writeblog namespace
app.use("/api/v1/blog", blogRouter);

// http://localhost:8000/api/v1/users/register

export { app }