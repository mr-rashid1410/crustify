require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB connection...");

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log("\n❌ MongoDB connection failed");
    console.log("Name:", error.name);
    console.log("Message:", error.message);

    console.log("\n========== SERVER ERRORS ==========");

    if (error.reason?.servers) {
      for (const [server, details] of error.reason.servers) {
        console.log("\nSERVER:", server);
        console.log("TYPE:", details.type);

        if (details.error) {
          console.log("ERROR NAME:", details.error.name);
          console.log("ERROR MESSAGE:", details.error.message);
          console.log("ERROR CODE:", details.error.code);
        }
      }
    }

    process.exit(1);
  });