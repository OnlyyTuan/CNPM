// Script tạo tuyến đường thứ 3
const mysql = require('mysql2/promise');

async function createRoute3() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'thinh2014',
    database: 'smartschoolbus'
  });

  try {
    // Tạo route
    await conn.query(`
      INSERT INTO route (id, route_name, distance, estimated_duration)
      VALUES ('R003', 'Tuyến Sáng Số 3', 15.0, 45)
    `);
    console.log('✅ Đã tạo tuyến R003');

    // Lấy các location hiện có để tạo waypoints
    const [locations] = await conn.query('SELECT id, name, latitude, longitude FROM location LIMIT 6');
    
    // Tạo waypoints cho tuyến R003
    for (let i = 0; i < Math.min(locations.length, 4); i++) {
      const loc = locations[i];
      await conn.query(`
        INSERT INTO route_waypoint (id, route_id, sequence, latitude, longitude, stop_name, is_stop)
        VALUES (?, 'R003', ?, ?, ?, ?, ?)
      `, [`RW_R003_${i + 1}`, i + 1, loc.latitude, loc.longitude, loc.name, i === 0 || i === 3 ? 1 : 0]);
      console.log(`  - Waypoint ${i + 1}: ${loc.name} ${i === 0 || i === 3 ? '(điểm dừng)' : ''}`);
    }

    console.log('✅ Hoàn tất tạo tuyến R003 với waypoints');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Tuyến R003 đã tồn tại');
    } else {
      console.error('❌ Lỗi:', error.message);
    }
  } finally {
    await conn.end();
  }
}

createRoute3();
