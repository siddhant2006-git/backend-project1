import express, { urlencoded } from "express";
import cors from "cors"

import cookieParser from "cookie-parser";
import router from "./routes/user_routes.js";


const app = express()

// credential-like username +password can be allowed to access them .
app.use(cors({
  origin: process.env.CORS_ORGIN,
  Credential:true
}))

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser)


// routes import

import userRouter from "./routes/user_routes.js"


// routes declaration
// app.use -is used to join the middleware to the register .

app.use("/api/users", userRouter)

//http://localhost:8000/api/v1/users/register .




export{app}