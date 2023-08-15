import express from "express";
import { TodayCounts, addURL, findClickedCount, findMonthCount, getAllData } from "../Controllers/url.js";

const router = express.Router();

router.post("/add", addURL);

router.get("/visited/:shorturl", findClickedCount)

router.get("/get/alldata", getAllData)

router.get("/month/count", findMonthCount)

router.get("/today/count", TodayCounts)



export const urlRouter = router;