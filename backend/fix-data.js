// Fix UTF-8 data in database
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'thinh2014',
    database: 'smartschoolbus',
    charset: 'utf8mb4'
  });

  console.log('✅ Connected to database');

  // Delete old corrupted data
  await connection.execute('DELETE FROM location');
  console.log('🗑️  Deleted old data');

  // Insert with correct UTF-8
  const locations = [
    ['L001', 'Trường Tiểu học Nguyễn Du', '123 Nguyễn Trãi, Q1', 10.762622, 106.660172, 'SCHOOL'],
    ['L002', 'Điểm đón Lê Lợi', '456 Lê Lợi, Q1', 10.763000, 106.661000, 'PICKUP_POINT'],
    ['L003', 'Điểm đón Hai Bà Trưng', '789 Hai Bà Trưng, Q3', 10.764000, 106.662000, 'PICKUP_POINT'],
    ['L004', 'Điểm đón Nguyễn Huệ', '321 Nguyễn Huệ, Q1', 10.765000, 106.663000, 'PICKUP_POINT'],
    ['L005', 'Bãi đỗ xe trường', 'Sân sau trường', 10.762800, 106.660200, 'PARKING'],
    ['L006', 'Điểm đón Cách Mạng Tháng 8', '100 Cách Mạng Tháng 8, Q3', 10.768000, 106.665000, 'PICKUP_POINT'],
    ['L007', 'Điểm đón Điện Biên Phủ', '200 Điện Biên Phủ, Q3', 10.770000, 106.667000, 'PICKUP_POINT'],
    ['L008', 'Điểm trả Pasteur', '50 Pasteur, Q1', 10.763500, 106.661500, 'PICKUP_POINT'],
    ['L009', 'Điểm trả Lý Tự Trọng', '80 Lý Tự Trọng, Q1', 10.764500, 106.662500, 'PICKUP_POINT'],
    ['L010', 'Điểm trả Nam Kỳ Khởi Nghĩa', '120 Nam Kỳ Khởi Nghĩa, Q1', 10.765500, 106.663500, 'PICKUP_POINT']
  ];

  for (const loc of locations) {
    await connection.execute(
      'INSERT INTO location (id, name, address, latitude, longitude, type) VALUES (?, ?, ?, ?, ?, ?)',
      loc
    );
    console.log(`✅ Inserted: ${loc[1]}`);
  }

  // Fix route names
  await connection.execute('UPDATE route SET route_name = ? WHERE id = ?', ['Tuyến Sáng Số 1', 'R001']);
  await connection.execute('UPDATE route SET route_name = ? WHERE id = ?', ['Tuyến Sáng Số 2', 'R002']);
  console.log('✅ Updated route names');

  // Verify
  const [rows] = await connection.execute('SELECT id, name, address FROM location ORDER BY id');
  console.log('\n📍 Verified data:');
  rows.forEach(row => {
    console.log(`${row.id}: ${row.name} - ${row.address}`);
  });

  await connection.end();
  console.log('\n✅ Done!');
}

fixData().catch(console.error);
