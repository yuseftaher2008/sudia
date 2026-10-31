import express from "express";
import "dotenv/config";
const Port:number = Number(process.env.PORT) || 3000;
const app = express();

app.get("/api",(_req,res) => {
    res.json("hello world!")
});

app.listen(Port, ()=> {
    console.log(`listening on port : ${Port}`)
})