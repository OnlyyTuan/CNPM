require("dotenv").config();
const db = require("../src/db");
const driverService = require("../src/services/driverService");

(async () => {
  try {
    await db.connectDB();
    const drivers = await driverService.getAvailableDrivers();
    console.log(
      "Available drivers:",
      drivers.map((d) => ({
        id: d.id,
        userId: d.user_id || d.userId || (d.User && d.User.id),
        fullName: d.full_name || d.fullName,
      }))
    );
    process.exit(0);
  } catch (err) {
    console.error("Error listing drivers:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
