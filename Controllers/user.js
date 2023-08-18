import jwt from "jsonwebtoken";
import { client } from "../db.js";
import { ObjectId } from "bson";

export function findEmail(email) {
    return client
        .db("urlshortener")
        .collection("users")
        .findOne({ email: email })
}

export function insertUser(user) {
    return client
        .db("urlshortener")
        .collection("users")
        .insertOne(user)
}

export function deleteUser(id) {
    return client
        .db("urlshortener")
        .collection("users")
        .deleteOne({ _id: new ObjectId(id) })
}

export function linkActive(id, data) {
    return client
        .db("urlshortener")
        .collection("users")
        .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data })
}

export function generateToken(id) {
    return jwt.sign(
        { id },
        process.env.SECURE_KEY,
        { expiresIn: "10d" }
    )
}

export function randomToken(email) {
    return jwt.sign(
        { email },
        process.env.SECURE_KEY,
        { expiresIn: "30m" }
    )
}

export function saverandomToken(email, randomkey) {
    return client
        .db("urlshortener")
        .collection("users")
        .findOneAndUpdate({ email: email }, { $set: randomkey })
}

export function deleterandomToken(email, data) {
    return client
        .db("urlshortener")
        .collection("users")
        .updateOne({ email: email }, { $unset: data })
}

export function updateNewPassword(email, newPassword) {
    return client
        .db("urlshortener")
        .collection("users")
        .findOneAndUpdate({ email: email }, { $set: newPassword })
}