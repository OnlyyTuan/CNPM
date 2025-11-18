const axios = require("axios");

async function testDriversAPI() {
  try {
    console.log("🧪 Testing GET /api/v1/drivers...\n");

    const response = await axios.get("http://localhost:5000/api/v1/drivers");

    console.log("✅ Status:", response.status);
    console.log("📊 Total drivers:", response.data.length);
    console.log("\n📋 Drivers data:");
    console.table(response.data);

    if (response.data.length === 0) {
      console.log("\n⚠️  Không có tài xế nào trong database!");
    }
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testDriversAPI();
