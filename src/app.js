import "dotenv/config";
import express from "express";
import morgan from "morgan";
import redis from "./config/redis.js";
import User from "./models/user.model.js";
import rateLimit from "express-rate-limit";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: {
        error: "Too many requests. Please try again later"
    },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: true
});

app.use(globalLimiter);

app.get("/", (req, res) => {
    let sum = 0;

    for(let i = 0; i < 100000000; i++) {
        sum += i;
    }

    return res.json({
        message: "Sum Calculated",
        data: sum
    })
})

app.get("/user/:id", async (req, res) => {
  const userFromCache = await redis.get(`user:${req.params.id}`);

  if (userFromCache) {
    console.log(userFromCache);
    return res.status(200).json({
      message: "User data fetched from cache",
    });
  }

  const user = await User.findOne({ _id: req.params.id });

  await redis.set(`user:${user._id.toString()}`, JSON.stringify(user));

  return res.status(200).json({
    message: "User data fetched successfully",
    data: user,
  });
});

app.get("/users", async (req, res) => {
//   const userFromCache = await redis.get(`user:${req.params.id}`);

//   if (userFromCache) {
//     console.log(userFromCache);
//     return res.status(200).json({
//       message: "User data fetched from cache",
//     });
//   }

  const user = await User.find();

//   await redis.set(`user:${user._id.toString()}`, JSON.stringify(user));/

  return res.status(200).json({
    message: "User data fetched successfully",
    data: user,
  });
});

app.post("/user", async (req, res) => {
  const newUser = await User.create(req.body);

  return res.status(200).json({
    message: "User created successfully",
    data: newUser,
  });
});

export default app;
