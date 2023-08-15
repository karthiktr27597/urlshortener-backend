import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongoURL = process.env.MONGO_URL;


const dbConnetion = async () => {
    const client = new MongoClient(mongoURL);
    await client.connect();
    console.log("db connected")
    // console.log(client);
    return client
}

export const client = await dbConnetion();
