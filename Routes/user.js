import express from "express";
import { deleteUser, deleterandomToken, findEmail, generateToken, insertUser, linkActive, randomToken, saverandomToken, updateNewPassword } from "../Controllers/user.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const router = express.Router();

const front_url = "https://urlshortenerpage.netlify.app"

const transport = nodemailer.createTransport({
    service: "outlook",
    auth: {
        user: 'resetpasswordkar27@hotmail.com',
        pass: process.env.PASSWORD
    }
})

// singup api
router.post("/signup", async (req, res) => {
    try {
        const user = req.body;
        //console.log(user);
        if (!user.email || !user.firstname || !user.lastname || !user.password) {
            return res.status(400).json({ message: "Incorrect Input" })
        }
        const usercheck = await findEmail(user.email)
        if (usercheck) {
            return res.status(400).json({ message: "User all ready exists" })
        } else {
            const solt = await bcrypt.genSalt(10);
            const hashedpassword = await bcrypt.hash(user.password, solt);
            const hasheduser = { ...user, password: hashedpassword };
            const insertedUser = await insertUser(hasheduser);
            console.log(hasheduser);
            if (!insertedUser.acknowledged) {
                return res.status(400).json({ message: "error found in insert user" })
            }
            const activationLink = `https://urlshortener-backend-qyy5.onrender.com/user/signup/active/${process.env.ACTIVATION_LINK}/${hasheduser._id}`
            const mailOptions = {
                from: 'resetpasswordkar27@hotmail.com',
                to: user.email,
                subject: "URL Shortener App- Account activation link",
                text: `Click below link to activate your account and login ${activationLink}`
            }
            transport.sendMail(mailOptions, async (err, info) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({ message: "error found in send activation mail" })
                    const deletedUser = await deleteUser(insertedUser._id);
                    if (!deletedUser) {
                        return res.status(400).json({ message: "Error found in delete user after activation link failure" })
                    }
                } else {
                    console.log('Send mail', + info)
                    return res.status(200).json({ message: "Activation link successfully send to user" })
                }
            })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "internal server error" })
    }
})

// link activation api
router.get(`/signup/active/${process.env.ACTIVATION_LINK}/:id`, async (req, res) => {
    try {
        const userId = req.params.id;
        const { id } = req.params;
        console.log(id);
        if (!userId) {
            return res.status(400).json({ message: "Invalid link" })
        }
        const linkActivated = await linkActive(userId, { active: true })
        console.log(linkActivated);
        if (!linkActivated) {
            return res.status(400).json({ message: "link activation failed" })
        }
        res.redirect("https://urlshortenerpage.netlify.app/login")
        // return res.status(200).json({ message: "link activation success" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" })
    }
})

// login
router.post("/login", async (req, res) => {
    try {
        const user = req.body;
        if (!user.email || !user.password) {
            return res.status(400).json({ message: "Incorrect Input" })
        }
        const usercheck = await findEmail(user.email)
        if (!usercheck) {
            return res.status(400).json({ message: "Incorrect username or password" })
        } else {
            // console.log(user, usercheck.password)
            if (usercheck.active !== true) {
                return res.status(400).json({ message: "Account not activated, Plese check your email for activate your account" })
            }
            const passwordVerify = await bcrypt.compare(user.password, usercheck.password)
            if (!passwordVerify) {
                return res.status(400).json({ message: "Incorrect username or password" })
            }
            const token = await generateToken(usercheck._id)
            if (!token) {
                return res.status(400).json({ message: "Error found in token generation" })
            }
            return res.status(200).json({ message: "logged in successfully", email: usercheck.email, token: token })
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" })
    }
})

// forgotpassword - mail verify
router.post("/mailverify", async (req, res) => {
    try {
        const email = req.body.email;
        if (!email) {
            return res.status(400).json({ message: "Invalid Input" })
        }
        const usercheck = await findEmail(email)
        if (!usercheck) {
            return res.status(400).json({ message: "mail varification failed, Invalid mail" })
        }
        if (usercheck.active !== true) {
            return res.status(400).json({ message: "Account not activated, Plese check your email for activate your account" })
        }
        return res.status(200).json({ message: "mail verified successfully" })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" })
    }
})

// forgot-password api
router.post("/forgotpassword", async (req, res) => {
    try {
        const rtoken = await randomToken(req.body.email);
        if (!rtoken) {
            return res.status(400).json({ message: "error found in token generate" })
        }
        const url = `${front_url}/passwordreset/${rtoken}/${req.body.email}`
        const mailOptions = {
            from: 'resetpasswordkar27@hotmail.com',
            to: req.body.email,
            subject: "URL Shortener App- Password reset link",
            text: `Click below link to reset your password and this link valid till 10 minutes only: ${url}`
        }
        const savedRandomkey = saverandomToken(req.body.email, { randomkey: rtoken })
        if (!savedRandomkey) {
            return res.status(400).json({ message: "error found in save random token" })
        }
        transport.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.log(err);
                res.status(400).json({ message: "error found in send password-reset mail" })
            } else {
                console.log('Send mail', + info)
                return res.status(200).json({ message: "password-reset mail successfully sent to user" })
            }
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" })
    }
})

// password reset url check
router.post("/passwordreset/:rtoken/:mail", async (req, res) => {
    try {
        const { rtoken, mail } = req.params;
        const { newpassword, confirmpassword } = req.body;
        if (!rtoken || !mail) {
            return res.status(400).json({ message: "Invalid link" })
        }
        const user = await findEmail(mail)
        if (user.randomkey !== rtoken) {
            return res.status(400).json({ message: "Invalid link" })
        }
        if (newpassword !== confirmpassword) {
            return res.status(400).json({ message: "password not matched" })
        }
        const solt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(newpassword, solt)
        const updatedPassword = await updateNewPassword(mail, hashedpassword)
        if (!updatedPassword) {
            return res.status(400).json({ message: "Error found in update password" })
        }
        const deletedRandomkey = await deleterandomToken(mail, { randomkey: rtoken })
        if (!deletedRandomkey) {
            return res.status(400).json({ message: "Error found in delete random key" })
        }

        return res.status(200).json({ message: "password updated successfully" })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" })
    }
})


export const userRouter = router;