import mongoose from "mongoose";

async function connectToDB () {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected")
}

export default connectToDB;