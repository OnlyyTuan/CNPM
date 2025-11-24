// bus-simulator.js - Giả lập xe bus di chuyển THEO TUYẾN ĐƯỜNG
// Chạy: node bus-simulator.js

const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";

// Waypoints cho từng tuyến (lấy từ database)
const ROUTE_WAYPOINTS = {
  R001: [], // Sẽ load từ API
  R002: [], // Sẽ load từ API
};

// Cấu hình xe bus với tuyến đường
const buses = [
  {
    id: "B001",
    name: "Xe 51A-12345",
    routeId: "R001",
    currentWaypointIndex: 0,
    currentLat: null,
    currentLng: null,
    speed: 35,
    progress: 0, // 0-1, tiến trình giữa 2 waypoint
  },
  {
    id: "B002",
    name: "Xe 51B-67890",
    routeId: "R002",
    currentWaypointIndex: 0,
    currentLat: null,
    currentLng: null,
    speed: 30,
    progress: 0,
  },
  {
    id: "B003",
    name: "Xe 51C-11111",
    routeId: "R001",
    currentWaypointIndex: 3, // Bắt đầu từ giữa tuyến
    currentLat: null,
    currentLng: null,
    speed: 0, // Xe đang đỗ
    progress: 0,
  },
];

// Load waypoints từ API
async function loadRouteWaypoints(routeId) {
  try {
    const response = await axios.get(`${BASE_URL}/routes/${routeId}/waypoints`);
    ROUTE_WAYPOINTS[routeId] = response.data.waypoints;
    console.log(
      `✅ Load ${ROUTE_WAYPOINTS[routeId].length} waypoints cho tuyến ${routeId}`
    );
  } catch (error) {
    console.error(`❌ Lỗi load waypoints cho ${routeId}:`, error.message);
  }
}

// Tính khoảng cách giữa 2 điểm (đơn giản)
function getDistance(lat1, lng1, lat2, lng2) {
  const dlat = lat2 - lat1;
  const dlng = lng2 - lng1;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

// Hàm cập nhật vị trí xe theo tuyến
async function updateBusLocation(bus) {
  try {
    const waypoints = ROUTE_WAYPOINTS[bus.routeId];
    if (!waypoints || waypoints.length === 0) return;

    // Lấy waypoint hiện tại và waypoint tiếp theo
    const currentWp = waypoints[bus.currentWaypointIndex];
    const nextWpIndex = (bus.currentWaypointIndex + 1) % waypoints.length;
    const nextWp = waypoints[nextWpIndex];

    // Debug: Check if waypoints have valid data
    if (
      !currentWp ||
      !nextWp ||
      typeof currentWp.latitude === "undefined" ||
      typeof nextWp.latitude === "undefined"
    ) {
      console.error(`❌ Invalid waypoint data for ${bus.name}:`, {
        currentWp,
        nextWp,
      });
      return;
    }

    // Nếu chưa có vị trí, bắt đầu từ waypoint đầu
    if (bus.currentLat === null) {
      bus.currentLat = parseFloat(currentWp.latitude);
      bus.currentLng = parseFloat(currentWp.longitude);
    }

    // Tính bước di chuyển (dựa trên tốc độ)
    // 1 km/h ≈ di chuyển 0.00001 độ mỗi giây (xấp xỉ cho Việt Nam)
    const stepSize = (bus.speed / 3600) * 0.01; // mỗi 2 giây

    // Tính khoảng cách còn lại đến waypoint tiếp theo
    const distanceToNext = getDistance(
      bus.currentLat,
      bus.currentLng,
      nextWp.latitude,
      nextWp.longitude
    );

    // Nếu gần đến waypoint tiếp theo, chuyển sang waypoint mới
    if (distanceToNext < stepSize * 2) {
      bus.currentWaypointIndex = nextWpIndex;
      bus.currentLat = parseFloat(nextWp.latitude);
      bus.currentLng = parseFloat(nextWp.longitude);
      bus.progress = 0;

      // Thay đổi tốc độ ngẫu nhiên khi đến waypoint
      if (bus.speed > 0) {
        bus.speed = Math.max(
          20,
          Math.min(60, bus.speed + (Math.random() * 20 - 10))
        );
      }

      console.log(
        `  🚏 ${bus.name} đến ${nextWp.stop_name || "điểm " + nextWpIndex}`
      );
    } else {
      // Di chuyển về phía waypoint tiếp theo
      bus.progress += stepSize / distanceToNext;
      bus.progress = Math.min(1, bus.progress);

      // Interpolate giữa waypoint hiện tại và tiếp theo
      const fromLat = parseFloat(currentWp.latitude);
      const fromLng = parseFloat(currentWp.longitude);
      const toLat = parseFloat(nextWp.latitude);
      const toLng = parseFloat(nextWp.longitude);

      bus.currentLat = fromLat + (toLat - fromLat) * bus.progress;
      bus.currentLng = fromLng + (toLng - fromLng) * bus.progress;
    }

    // Gửi vị trí mới lên server
    await axios.put(`${BASE_URL}/buses/${bus.id}/location`, {
      latitude: bus.currentLat,
      longitude: bus.currentLng,
      speed: bus.speed,
    });

    console.log(
      `[${new Date().toLocaleTimeString("vi-VN")}] ${bus.name}: ` +
        `lat=${bus.currentLat.toFixed(6)}, lng=${bus.currentLng.toFixed(6)}, ` +
        `speed=${bus.speed.toFixed(1)} km/h, waypoint ${
          bus.currentWaypointIndex
        }→${nextWpIndex}`
    );
  } catch (error) {
    console.error(`❌ Lỗi cập nhật ${bus.name}:`, error.message);
  }
}

// Khởi tạo và chạy simulator
async function startSimulator() {
  console.log("🚌 Bắt đầu giả lập xe bus di chuyển THEO TUYẾN ĐƯỜNG...\n");

  // Load waypoints cho tất cả các tuyến
  console.log("📍 Đang load waypoints từ server...");
  await loadRouteWaypoints("R001");
  await loadRouteWaypoints("R002");

  console.log(`\n🚍 Đang theo dõi ${buses.length} xe:`);
  buses.forEach((bus) => {
    const waypoints = ROUTE_WAYPOINTS[bus.routeId];
    console.log(
      `  - ${bus.name} (${bus.id}) - Tuyến ${bus.routeId} (${
        waypoints ? waypoints.length : 0
      } điểm)`
    );
  });
  console.log("\n🔄 Cập nhật vị trí mỗi 2 giây. Nhấn Ctrl+C để dừng.\n");

  // Cập nhật mỗi 2 giây
  setInterval(() => {
    buses.forEach((bus) => {
      // Chỉ cập nhật xe đang di chuyển (speed > 0)
      if (bus.speed > 0) {
        updateBusLocation(bus);
      }
    });
  }, 2000);
}

// Bắt đầu
startSimulator().catch((err) => {
  console.error("❌ Lỗi khởi động simulator:", err);
  process.exit(1);
});
