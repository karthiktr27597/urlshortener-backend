import mongoose from "mongoose";


mongoose.set("strictQuery", true)

export async function connectToMonogDB(url) {
    return mongoose.connect(url)
}

