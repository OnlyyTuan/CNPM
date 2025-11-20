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
        // 2. Lấy stops trên tuyến của xe bus
        const [stops] = await connection.execute(`
          SELECT DISTINCT l.id as location_id, l.name, rw.sequence
          FROM route_waypoint rw
          JOIN location l ON ABS(rw.latitude - l.latitude) < 0.0001 
                         AND ABS(rw.longitude - l.longitude) < 0.0001
          WHERE rw.route_id = ? AND rw.is_stop = 1
          ORDER BY rw.sequence
        `, [student.route_id]);

        if (stops.length === 0) {
          console.log(`⚠️  ${student.full_name} (${student.id}): Không tìm thấy stops trên tuyến ${student.route_id}`);
          errorCount++;
          continue;
        }

        // 3. Gán pickup = stop đầu tiên, dropoff = stop cuối cùng
        const pickupLocation = stops[0].location_id;
        const dropoffLocation = stops[stops.length - 1].location_id;

        await connection.execute(`
          UPDATE student 
          SET pickup_location_id = ?, dropoff_location_id = ?
          WHERE id = ?
        `, [pickupLocation, dropoffLocation, student.id]);

        console.log(`✅ ${student.full_name} (${student.id}):`);
        console.log(`   Pickup: ${stops[0].name} (${pickupLocation})`);
        console.log(`   Dropoff: ${stops[stops.length - 1].name} (${dropoffLocation})`);
        
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
