import "dotenv/config";
import express from "express";
import v1Router from "./v1/v1.routes.js";
//import dotenv from "dotenv";
import cors from "cors";
import { notFoundMiddleware } from "./v1/middlewares/notFound.middleware.js";
import connectDB from "./v1/config/db.config.js";
import { errorMiddleware } from "./v1/middlewares/error.middleware.js";
//import { limiter } from "./v1/middlewares/limiter.middleware.js";

//dotenv.config();
connectDB();

const app=express();
app.use(cors(/*{
    origin: "http://localhost:5500",
    allowedHeaders:["Content-Type","Authorization"],
    methods: ["GET","POST","PATCH","PUT","DELETE"]
}*/));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//app.use(limiter);

app.get("/",(req,res)=>{
    res.send("Respuesta del servidor a la raíz")
});

app.use("/v1",v1Router);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;