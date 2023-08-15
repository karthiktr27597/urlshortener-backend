import { URL } from "../Models/url.js";
import { nanoid } from "nanoid";

export async function addURL(req, res) {

    if (!req.body.longurl) {
        return res.status(400).json({ message: "Invalid URL" })
    }
    const nanoID = nanoid(7);
   // console.log(nanoID)

    const date = new Date()
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const day = date.getDate();
    const yearMonth = year + "" + month;
    const today = year + "" + month + "" + day;

    const data = new URL({
        longurl: req.body.longurl,
        shorturl: nanoID,
        month: yearMonth,
        date: today
    })

    data.save()
        .then(() => {
            res.status(200).json({ data: nanoID })
            console.log('data saved')
        })
        .catch((err) => {
            console.log(err)
        })
}


export const findClickedCount = async (req, res) => {
    try {
        const shortURL = req.params.shorturl;
        if (!shortURL) {
            res.status(200).json({ message: "Invalid URL" })
        }
        const result = await URL.findOne({
            shorturl: shortURL
        })
        res.json({
            TotalVisited: result.visitedhistory.length,
            data: result.visitedhistory
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllData = async (req, res) => {
    try {
        const result = await URL.find();
        res.status(200).json({ data: result })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const findMonthCount = async (req, res) => {
    try {
        // const date = new Date()
        // const mon = date.getMonth() + 1;
        // const year = date.getFullYear();
        // const month = year + "" + mon;
        // const result = await URL.find(
        //     {
        //         month,
        //     }
        // )
        const monthlyCount = await URL.aggregate(
            [
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m", date: '$createdon'
                            }
                        },
                        count: { $sum: 1 }
                    }
                }

            ]
        )

        return res.status(200).json({ data: monthlyCount })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const TodayCounts = async (req, res) => {
    try {
        // const date = new Date()
        // const month = date.getMonth() + 1;
        // const year = date.getFullYear();
        // const day = date.getDay();
        // const today = year + "" + month + "" + day;

        // const result = await URL.find(
        //     {
        //         date: today
        //     }
        // )
        // console.log(result);


        const dailyCounts = await URL.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdon' } },
                    count: { $sum: 1 },
                },
            },
        ]);

        return res.status(200).json({ data: dailyCounts })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" })
    }
}

