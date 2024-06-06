import express, { Request, Response, NextFunction } from "express";
import connectDB from "./dbConnection";
import cors from "cors";
import dotenv from "dotenv";

import cookieParser from "cookie-parser";

import session from "express-session";

import passport from "./auth/passport";
import authConfig from "./auth/authConfig";

//import router from './routes/loginRoutes';
//import cookieSession from 'cookie-session';
import authRouter from "./routes/authRoutes";
import gigRoutes from "./routes/gigRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    ],
    credentials: true, // Add this line to allow credentials (cookies)
  })
);

app.use(express.urlencoded({ extended: true })); // express in-built body-parser
//app.use(cookieSession({ keys: ['laskdjf'] }));
app.use(express.json()); // express in-built body-parser

// app.use(
//   session({
//     secret: "SUPER_SECRET",
//     resave: false,
//     saveUninitialized: true,
//   })
// );
app.use(passport.initialize());
//app.use(passport.session());
 
//app.use(router);
app.use("/auth", authRouter);
app.use("/user", userRoutes);
app.use("/gigs", gigRoutes);
app.use("/order", orderRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error While Processing Request" });
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});

// passport is installed but not used, uninstall if not required
// sessions and cookies is not built, there will be no persistance, however cookieSession middleware is being used and is installed remove if not used
