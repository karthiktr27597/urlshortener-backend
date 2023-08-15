import mongoose from "mongoose";


// Schema
const urlSchema = new mongoose.Schema(
    {
        shorturl: {
            type: String,
            required: true,
            unique: true
        },
        longurl: {
            type: String,
            required: true,
        },
        visitedhistory: [{ timestamp: { type: Number } }],
        clickcount: {
            type: Number
        },
        createdon: {
            type: Date,
            default: Date.now(),
            required: true
        },
        date: {
            type: String,
            requried: true
        },
        month: {
            type: String,
            required: true
        }
    }
)

// modify schema

urlSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// Model
export const URL = mongoose.model("URL", urlSchema);

