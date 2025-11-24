// update-route3-waypoints.js - Cập nhật waypoints cho Route R003
// Tuyến mới đi qua khu vực khác (Quận 1 - Quận 3 - Quận 10) tránh trùng R002

const db = require('./src/db');

async function updateRoute3Waypoints() {
  try {
    console.log('🗺️  Đang cập nhật waypoints cho tuyến R003...\n');

    // Xóa waypoints cũ của R003
    await db.RouteWaypoint.destroy({
      where: { route_id: 'R003' }
    });
    console.log('✅ Đã xóa waypoints cũ của R003');

    // Waypoints mới cho R003 - Tuyến qua Quận 1, 3, 10
    // Đi qua các đường khác hoàn toàn so với R002
    const newWaypoints = [
      {
        route_id: 'R003',
        sequence: 1,
        latitude: 10.7756,  // Bến Thành Market (Quận 1)
        longitude: 106.6980,
        stop_name: 'Chợ Bến Thành',
        is_stop: true
      },
      {
        route_id: 'R003',
        sequence: 2,
        latitude: 10.7681,  // Đường Pasteur (Quận 3)
        longitude: 106.6915,
        stop_name: 'Đường Pasteur',
        is_stop: false
      },
      {
        route_id: 'R003',
        sequence: 3,
        latitude: 10.7714,  // Cách Mạng Tháng 8 (Quận 3)
        longitude: 106.6634,
        stop_name: 'Cách Mạng Tháng 8',
        is_stop: true
      },
      {
        route_id: 'R003',
        sequence: 4,
        latitude: 10.7695,  // Đường 3/2 (Quận 10)
        longitude: 106.6565,
        stop_name: 'Đường 3 Tháng 2',
        is_stop: false
      },
      {
        route_id: 'R003',
        sequence: 5,
        latitude: 10.7602,  // Bến xe An Sương (Quận 10)
        longitude: 106.6371,
        stop_name: 'Khu vực Quận 10',
        is_stop: true
      }
    ];

    // Thêm waypoints mới
    await db.RouteWaypoint.bulkCreate(newWaypoints);
    console.log(`✅ Đã thêm ${newWaypoints.length} waypoints mới cho R003\n`);

    // Hiển thị waypoints đã thêm
    console.log('📍 Danh sách waypoints mới:');
    newWaypoints.forEach((wp, index) => {
      console.log(`   ${index + 1}. ${wp.stop_name} ${wp.is_stop ? '(điểm dừng)' : ''}`);
      console.log(`      → Lat: ${wp.latitude}, Lng: ${wp.longitude}`);
    });

    console.log('\n✅ Cập nhật thành công! Tuyến R003 giờ đi qua khu vực khác.');
    console.log('🔄 Hãy restart bus-simulator để xe chạy theo tuyến mới.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updateRoute3Waypoints();
