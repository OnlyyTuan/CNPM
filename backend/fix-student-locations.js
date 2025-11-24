// backend/fix-student-locations.js
// Script sửa lại pickup/dropoff locations cho học sinh
// Gán điểm đón/trả là điểm dừng đầu tiên trên tuyến của xe bus

const mysql = require('mysql2/promise');

async function fixStudentLocations() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'thinh2014',
      database: 'smartschoolbus'
    });

    console.log('✅ Kết nối database thành công!\n');

    // 1. Lấy tất cả học sinh có xe bus được phân công
    const [students] = await connection.execute(`
      SELECT s.id, s.full_name, s.assigned_bus_id, b.route_id
      FROM student s
      JOIN bus b ON s.assigned_bus_id = b.id
      WHERE s.assigned_bus_id IS NOT NULL AND b.route_id IS NOT NULL
    `);

    console.log(`📋 Tìm thấy ${students.length} học sinh cần sửa\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // 2. Lấy stops trên tuyến của xe bus (trực tiếp từ route_waypoint)
        const [stops] = await connection.execute(`
          SELECT rw.id, rw.stop_name, rw.sequence, rw.latitude, rw.longitude
          FROM route_waypoint rw
          WHERE rw.route_id = ? AND rw.is_stop = 1
          ORDER BY rw.sequence
        `, [student.route_id]);

        if (stops.length === 0) {
          console.log(`⚠️  ${student.full_name} (${student.id}): Không tìm thấy stops trên tuyến ${student.route_id}`);
          errorCount++;
          continue;
        }

        // 3. Tìm hoặc tạo location tương ứng với stop
        const firstStop = stops[0];
        const lastStop = stops[stops.length - 1];

        // Tìm location cho pickup (stop đầu tiên)
        let [pickupLocations] = await connection.execute(`
          SELECT id FROM location 
          WHERE ABS(latitude - ?) < 0.0001 AND ABS(longitude - ?) < 0.0001
          LIMIT 1
        `, [firstStop.latitude, firstStop.longitude]);

        let pickupLocationId;
        if (pickupLocations.length > 0) {
          pickupLocationId = pickupLocations[0].id;
        } else {
          // Tạo location mới từ stop
          const newId = `LOC_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          await connection.execute(`
            INSERT INTO location (id, name, latitude, longitude, type, address)
            VALUES (?, ?, ?, ?, 'stop', '')
          `, [newId, firstStop.stop_name || 'Điểm dừng', firstStop.latitude, firstStop.longitude]);
          pickupLocationId = newId;
          console.log(`   📍 Tạo location mới: ${pickupLocationId} - ${firstStop.stop_name}`);
        }

        // Tìm location cho dropoff (stop cuối cùng)
        let [dropoffLocations] = await connection.execute(`
          SELECT id FROM location 
          WHERE ABS(latitude - ?) < 0.0001 AND ABS(longitude - ?) < 0.0001
          LIMIT 1
        `, [lastStop.latitude, lastStop.longitude]);

        let dropoffLocationId;
        if (dropoffLocations.length > 0) {
          dropoffLocationId = dropoffLocations[0].id;
        } else {
          // Tạo location mới từ stop
          const newId = `LOC_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          await connection.execute(`
            INSERT INTO location (id, name, latitude, longitude, type, address)
            VALUES (?, ?, ?, ?, 'stop', '')
          `, [newId, lastStop.stop_name || 'Điểm dừng', lastStop.latitude, lastStop.longitude]);
          dropoffLocationId = newId;
          console.log(`   📍 Tạo location mới: ${dropoffLocationId} - ${lastStop.stop_name}`);
        }

        // 4. Cập nhật student
        await connection.execute(`
          UPDATE student 
          SET pickup_location_id = ?, dropoff_location_id = ?
          WHERE id = ?
        `, [pickupLocationId, dropoffLocationId, student.id]);

        console.log(`✅ ${student.full_name} (${student.id}):`);
        console.log(`   Pickup: ${firstStop.stop_name} (${pickupLocationId})`);
        console.log(`   Dropoff: ${lastStop.stop_name} (${dropoffLocationId})`);
        
        successCount++;

      } catch (err) {
        console.error(`❌ Lỗi khi xử lý ${student.full_name}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Thành công: ${successCount}`);
    console.log(`   ❌ Lỗi: ${errorCount}`);

    await connection.end();

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

fixStudentLocations();
