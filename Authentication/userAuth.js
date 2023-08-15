import jwt from "jsonwebtoken"

export async function isAuthenticated(req, res, next) {
    const token = await req.headers["x-auth-token"];
    // console.log(token)
    if (!token) {
        return res.status(401).json({ message: "Invalid Authorization" })
    }
    jwt.verify(token, process.env.SECURE_KEY, (err, decoded) => {
        if (err) {
            if (err.name = "TokenExpiredError") {
                return res.status(401).json({ message: "Token expired" })
            }
            return res.status(500).json({ message: "Failed Authentication token" })
        }
        next();
    });
}