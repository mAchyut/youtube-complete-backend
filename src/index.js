import { configDotenv } from "dotenv";
import { app } from "./app.js";
import dbConnect from "./DB/db.js";
configDotenv();
// console.log(process.env.PORT);
dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is listening at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`issues with Database connection: ${error.message}`);
  });
