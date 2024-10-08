import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect = async () => {
  try {
    const dbResponse = await mongoose.connect(
      process.env.MONGODB_URL + "/" + DB_NAME
    );
    console.log(
      `MongoDB connection established at port ${dbResponse.connection.port}`
    );
  } catch (error) {
    console.log(`DB Connection Failed... ERROR :: ${error}`);
    process.exit(1);
  }
};

export default dbConnect;
