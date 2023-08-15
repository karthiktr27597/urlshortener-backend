import express from "express";
import { connectToMonogDB } from "./connectDB.js";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./Routes/user.js";
import { urlRouter } from "./Routes/url.js";
import { URL } from "./Models/url.js";
import { isAuthenticated } from "./Authentication/userAuth.js";
dotenv.config();

const PORT = process.env.PORT;

// server initiation
const app = express();

// db connection through mongoosh
connectToMonogDB(process.env.MONGOOSH_URL)
    .then(() => console.log("mongoDB connected via mongoosh"))


// middleware
app.use(express.json())
app.use(cors())


// application middleware
app.use("/user", userRouter);
app.use("/url", isAuthenticated, urlRouter);

// test
app.get("/", (req, res) => {
    res.send("URL-Shortener API working good")
})

// url redirect
app.get("/:shorturl", async (req, res) => {
    // increment visit and url redirect
    try {
        const { shorturl } = req.params
        // console.log(shorturl);
        const result = await URL.findOneAndUpdate({
            shorturl,
        }, {
            $push: {
                visitedhistory: {
                    timestamp: Date.now()
                }
            }
        })
        res.redirect(result.longurl)
    } catch (err) {
        console.log(err);
    }
})


// listen
app.listen(PORT, () => { console.log("Server started in localhost:", PORT) });
