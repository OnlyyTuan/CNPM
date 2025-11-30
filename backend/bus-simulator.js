// bus-simulator.js - Giả lập xe bus di chuyển THEO TUYẾN ĐƯỜNG THỰC TẾ (OSRM)
// Chạy: node bus-simulator.js

const axios = require("axios");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api/v1";

// Waypoints cho từng tuyến (sẽ load từ API)
const ROUTE_WAYPOINTS = {};

// OSRM route coordinates cho từng segment (cache)
const ROUTE_OSRM_PATHS = {};

// Cấu hình xe bus (sẽ load động từ database)
let buses = [];

// Sample fallback data (used when backend is unreachable or returns no buses)
const SAMPLE_ROUTES = {
  R_SAMPLE_1: {
    id: "R_SAMPLE_1",
    routeName: "Tuyến mẫu 1",
  },
};

const SAMPLE_WAYPOINTS = {
  R_SAMPLE_1: [
    { id: "R_SAMPLE_1_WP_1", sequence: 1, latitude: 10.76292, longitude: 106.660236, stop_name: "Điểm A" },
    { id: "R_SAMPLE_1_WP_2", sequence: 2, latitude: 10.76300, longitude: 106.66021, stop_name: "Điểm B" },
    { id: "R_SAMPLE_1_WP_3", sequence: 3, latitude: 10.81532, longitude: 106.70294, stop_name: "Điểm C" },
  ],
};

const SAMPLE_BUSES = [
  {
    id: "BUS_SAMPLE_1",
    license_plate: "B001",
    route_id: "R_SAMPLE_1",
    status: "ACTIVE",
  },
];


// Load waypoints từ API và OSRM route
async function loadRouteWaypoints(routeId) {
  try {
    // Try to load from server first
    const response = await axios.get(`${BASE_URL}/routes/${routeId}/waypoints`);
    ROUTE_WAYPOINTS[routeId] = response.data.waypoints;
    console.log(
      `✅ Load ${ROUTE_WAYPOINTS[routeId].length} waypoints cho tuyến ${routeId}`
    );

    // Load OSRM route cho tuyến này
    await loadOSRMRoute(routeId);

    return true;
  } catch (error) {
    // Nếu backend không trả về, kiểm tra fallback SAMPLE_WAYPOINTS
    if (SAMPLE_WAYPOINTS[routeId]) {
      ROUTE_WAYPOINTS[routeId] = SAMPLE_WAYPOINTS[routeId];
      console.warn(`⚠️ Không thể load waypoints từ server cho ${routeId}. Sử dụng dữ liệu mẫu.`);
      await loadOSRMRoute(routeId);
      return true;
    }

    console.error(`❌ Lỗi load waypoints cho ${routeId}:`, error.message);
    return false;
  }
}

// Load OSRM route coordinates
async function loadOSRMRoute(routeId) {
  try {
    const waypoints = ROUTE_WAYPOINTS[routeId];
    if (!waypoints || waypoints.length < 2) {
      console.warn(`⚠️ Tuyến ${routeId} không đủ waypoints để tạo route`);
      return;
    }

    // Tạo chuỗi tọa độ cho OSRM: lng,lat;lng,lat;...
    const coordinates = waypoints
      .map((wp) => `${wp.longitude},${wp.latitude}`)
      .join(";");

    // Gọi OSRM API
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
    const response = await axios.get(osrmUrl);

    if (
      response.data.code === "Ok" &&
      response.data.routes &&
      response.data.routes.length > 0
    ) {
      // OSRM trả về [lng, lat], chuyển thành [lat, lng]
      const coords = response.data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => ({ lat, lng })
      );
      ROUTE_OSRM_PATHS[routeId] = coords;
      console.log(
        `   🗺️  Load ${coords.length} điểm OSRM cho tuyến ${routeId}`
      );
    } else {
      console.warn(
        `   ⚠️ OSRM không tìm thấy route cho ${routeId}, dùng đường thẳng`
      );
      // Fallback: dùng waypoints gốc
      ROUTE_OSRM_PATHS[routeId] = waypoints.map((wp) => ({
        lat: parseFloat(wp.latitude),
        lng: parseFloat(wp.longitude),
      }));
    }
  } catch (error) {
    console.warn(
      `   ⚠️ Lỗi load OSRM cho ${routeId}: ${error.message}, dùng đường thẳng`
    );
    // Fallback
    const waypoints = ROUTE_WAYPOINTS[routeId];
    ROUTE_OSRM_PATHS[routeId] = waypoints.map((wp) => ({
      lat: parseFloat(wp.latitude),
      lng: parseFloat(wp.longitude),
    }));
  }
}

// Load danh sách xe bus từ API (lấy các xe đã được phân công tuyến)
async function loadBusesFromAPI() {
  try {
    console.log("📡 Đang tải danh sách xe bus từ server...");
    const response = await axios.get(`${BASE_URL}/buses`);
    const allBuses = response.data;
    // Lọc các xe đã được phân công tuyến và đang ACTIVE
    const activeBuses = Array.isArray(allBuses)
      ? allBuses
          .filter((bus) => bus.route_id && bus.status === "ACTIVE")
          .map((bus) => ({
            id: bus.id,
            name: `Xe ${bus.license_plate}`,
            routeId: bus.route_id,
            currentLat: null,
            currentLng: null,
            osrmIndex: 0, // Index trên OSRM path
            speed: Math.floor(Math.random() * 20) + 25, // Random 25-45 km/h
          }))
      : [];

    if (activeBuses.length > 0) {
      buses = activeBuses;
      console.log(`✅ Tìm thấy ${buses.length} xe đang hoạt động:`);
      buses.forEach((bus) => {
        console.log(`   - ${bus.name} (${bus.id}) → Tuyến ${bus.routeId}`);
      });
      return true;
    }

    // Nếu backend trả về rỗng, dùng dữ liệu mẫu để phát triển local
    console.warn("⚠️ Không tìm thấy xe ACTIVE từ server. Sử dụng dữ liệu mẫu local.");
    buses = SAMPLE_BUSES.map((bus) => ({
      id: bus.id,
      name: `Xe ${bus.license_plate}`,
      routeId: bus.route_id,
      currentLat: null,
      currentLng: null,
      osrmIndex: 0,
      speed: Math.floor(Math.random() * 20) + 25,
    }));
    // ensure route waypoints exist for sample routes
    for (const r of Object.keys(SAMPLE_ROUTES)) {
      ROUTE_WAYPOINTS[r] = SAMPLE_WAYPOINTS[r] || [];
      await loadOSRMRoute(r);
    }
    buses.forEach((bus) => console.log(`   - ${bus.name} (${bus.id}) → Tuyến ${bus.routeId} (sample)`));
    return buses.length > 0;
  } catch (error) {
    // Thêm logging chi tiết cho lỗi HTTP/axios
    if (error.response) {
      console.error(
        "❌ Lỗi load buses từ API: status=",
        error.response.status,
        "data=",
        JSON.stringify(error.response.data)
      );
    } else if (error.request) {
      console.error("❌ Lỗi load buses từ API: no response, request sent");
    } else {
      console.error("❌ Lỗi load buses từ API:", error.message);
    }

    // Nếu lỗi kết nối, dùng dữ liệu mẫu
    console.warn("⚠️ Sử dụng dữ liệu mẫu local do lỗi khi gọi API.");
    buses = SAMPLE_BUSES.map((bus) => ({
      id: bus.id,
      name: `Xe ${bus.license_plate}`,
      routeId: bus.route_id,
      currentLat: null,
      currentLng: null,
      osrmIndex: 0,
      speed: Math.floor(Math.random() * 20) + 25,
    }));
    for (const r of Object.keys(SAMPLE_ROUTES)) {
      ROUTE_WAYPOINTS[r] = SAMPLE_WAYPOINTS[r] || [];
      await loadOSRMRoute(r);
    }
    buses.forEach((bus) => console.log(`   - ${bus.name} (${bus.id}) → Tuyến ${bus.routeId} (sample)`));
    return buses.length > 0;
  }
}

// Tính khoảng cách giữa 2 điểm (đơn giản)
function getDistance(lat1, lng1, lat2, lng2) {
  const dlat = lat2 - lat1;
  const dlng = lng2 - lng1;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

// Hàm cập nhật vị trí xe theo OSRM route
async function updateBusLocation(bus) {
  try {
    const osrmPath = ROUTE_OSRM_PATHS[bus.routeId];
    if (!osrmPath || osrmPath.length === 0) return;

    // Khởi tạo bus nếu chưa có vị trí
    if (bus.currentLat === null) {
      bus.currentLat = osrmPath[0].lat;
      bus.currentLng = osrmPath[0].lng;
      bus.osrmIndex = 0; // Index hiện tại trên OSRM path
    }

    // Tính bước di chuyển dựa trên tốc độ - GIẢM TỐC ĐỘ
    // Giảm từ 0.01 xuống 0.003 để xe di chuyển chậm hơn, mượt hơn
    const stepSize = (bus.speed / 3600) * 0.003; // mỗi 2 giây

    // Lấy điểm tiếp theo
    const nextIndex = (bus.osrmIndex + 1) % osrmPath.length;
    const nextPoint = osrmPath[nextIndex];

    // Tính khoảng cách đến điểm tiếp theo
    const distanceToNext = getDistance(
      bus.currentLat,
      bus.currentLng,
      nextPoint.lat,
      nextPoint.lng
    );

    if (distanceToNext < stepSize * 1.5) {
      // Chuyển sang điểm tiếp theo
      bus.currentLat = nextPoint.lat;
      bus.currentLng = nextPoint.lng;
      bus.osrmIndex = nextIndex;

      // Kiểm tra xem có đến waypoint chính không
      const waypoints = ROUTE_WAYPOINTS[bus.routeId];
      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i];
        const distToWp = getDistance(
          bus.currentLat,
          bus.currentLng,
          wp.latitude,
          wp.longitude
        );
        if (distToWp < 0.0001) {
          // ~10 mét
          console.log(`  🚏 ${bus.name} đến ${wp.stop_name || "điểm " + i}`);
          // Thay đổi tốc độ ngẫu nhiên
          if (bus.speed > 0) {
            bus.speed = Math.max(
              20,
              Math.min(50, bus.speed + (Math.random() * 10 - 5))
            );
          }
          break;
        }
      }
    } else {
      // Di chuyển mượt mà về phía điểm tiếp theo (interpolation)
      const ratio = Math.min(0.5, stepSize / distanceToNext); // Giới hạn tối đa 50% mỗi bước
      bus.currentLat =
        bus.currentLat + (nextPoint.lat - bus.currentLat) * ratio;
      bus.currentLng =
        bus.currentLng + (nextPoint.lng - bus.currentLng) * ratio;
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
        `speed=${bus.speed.toFixed(1)} km/h, OSRM ${bus.osrmIndex}/${
          osrmPath.length
        }`
    );
  } catch (error) {
    console.error(`❌ Lỗi cập nhật ${bus.name}:`, error.message);
  }
}

// Khởi tạo và chạy simulator
async function startSimulator() {
  console.log("🚌 Bắt đầu giả lập xe bus di chuyển THEO TUYẾN ĐƯỜNG...\n");

  // 1. Load danh sách xe bus từ API
  const busesLoaded = await loadBusesFromAPI();
  if (!busesLoaded || buses.length === 0) {
    console.error(
      "❌ Không tìm thấy xe nào để giả lập. Hãy phân công xe cho tuyến trước!"
    );
    process.exit(1);
  }

  // 2. Load waypoints cho tất cả các tuyến mà xe đang chạy
  console.log("\n📍 Đang load waypoints từ server...");
  const uniqueRoutes = [...new Set(buses.map((bus) => bus.routeId))];
  for (const routeId of uniqueRoutes) {
    await loadRouteWaypoints(routeId);
  }

  // 3. Kiểm tra waypoints đã load
  const missingRoutes = buses.filter(
    (bus) =>
      !ROUTE_WAYPOINTS[bus.routeId] || ROUTE_WAYPOINTS[bus.routeId].length === 0
  );
  if (missingRoutes.length > 0) {
    console.error("❌ Một số tuyến không có waypoints:");
    missingRoutes.forEach((bus) =>
      console.error(`   - ${bus.routeId} (cho xe ${bus.name})`)
    );
    process.exit(1);
  }

  console.log(
    `\n✅ Sẵn sàng theo dõi ${buses.length} xe trên ${uniqueRoutes.length} tuyến:`
  );
  uniqueRoutes.forEach((routeId) => {
    const busesOnRoute = buses.filter((b) => b.routeId === routeId);
    const osrmPoints = ROUTE_OSRM_PATHS[routeId]
      ? ROUTE_OSRM_PATHS[routeId].length
      : 0;
    console.log(
      `   - ${routeId}: ${busesOnRoute.length} xe (${ROUTE_WAYPOINTS[routeId].length} waypoints, ${osrmPoints} điểm OSRM)`
    );
  });

  console.log(
    "\n🔄 Cập nhật vị trí mỗi 2 giây. Tốc độ đã tối ưu để xe di chuyển mượt mà.\n"
  );

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
