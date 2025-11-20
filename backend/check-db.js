const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'thinh2014',
      database: 'smartschoolbus'
    });

    console.log('✅ Kết nối database thành công!\n');

    // Kiểm tra DEFAULT_PARENT_USER
    const [userRows] = await connection.execute(
      "SELECT id, username, email, role FROM user WHERE id='DEFAULT_PARENT_USER'"
    );
    console.log('📋 DEFAULT_PARENT_USER:');
    console.table(userRows);

    // Kiểm tra DEFAULT_PARENT
    const [parentRows] = await connection.execute(
      "SELECT * FROM parent WHERE id='DEFAULT_PARENT'"
    );
    console.log('📋 DEFAULT_PARENT:');
    console.table(parentRows);

    // Đếm số lượng records
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM user');
    const [parentCount] = await connection.execute('SELECT COUNT(*) as total FROM parent');
    const [studentCount] = await connection.execute('SELECT COUNT(*) as total FROM student');
    const [driverCount] = await connection.execute('SELECT COUNT(*) as total FROM driver');
    const [busCount] = await connection.execute('SELECT COUNT(*) as total FROM bus');

    console.log('📊 Thống kê dữ liệu:');
    console.log(`   Users: ${userCount[0].total}`);
    console.log(`   Parents: ${parentCount[0].total}`);
    console.log(`   Students: ${studentCount[0].total}`);
    console.log(`   Drivers: ${driverCount[0].total}`);
    console.log(`   Buses: ${busCount[0].total}`);

    await connection.end();

    if (parentRows.length > 0 && userRows.length > 0) {
      console.log('\n✅✅✅ DEFAULT_PARENT ĐÃ TỒN TẠI! Database sẵn sàng!');
      console.log('👉 Bây giờ bạn có thể thử thêm học sinh từ giao diện!');
    } else {
      console.log('\n❌ DEFAULT_PARENT chưa có!');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

checkDatabase();
