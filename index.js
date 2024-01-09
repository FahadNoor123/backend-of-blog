// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./src/db/index.js";
// const cookieParser = require('cookie-parser');
import cookieParser from 'cookie-parser';
app.use(cookieParser());

import cors from 'cors'
import {app} from './src/app.js'
dotenv.config({
    path: './.env'
})
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add the HTTP methods you want to allow
  }));
app.get( '/', (req,res)=>{
    res.send('Server is Ready')
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        app.get('/api/check-connection', (req, res) => {
            res.json({ message: 'Frontend and backend are connected!' });
          });
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})










/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/