/**
 * Script tạo dữ liệu mẫu cho dev: một tuyến, vài waypoint, một tài xế và một xe
 * Usage: node scripts/create_sample_data.js
 */
// Load backend/.env when running this script directly
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const db = require('../src/db');
const { v4: uuidv4 } = require('uuid');

async function run() {
  try {
    await db.connectDB();

    const Route = db.Route;
    const RouteWaypoint = db.RouteWaypoint;
    const User = db.User;
    const Driver = db.Driver;
    const Bus = db.Bus;
    const Location = db.Location;

    const routeId = 'R_SAMPLE_1';
    const driverId = 'DRIVER_SAMPLE_1';
    const userDriverId = 'U_DRIVER_SAMPLE_1';
    const busId = 'BUS_SAMPLE_1';

    // Tạo route nếu chưa có
    const [route] = await Route.findOrCreate({
      where: { id: routeId },
      defaults: {
        id: routeId,
        routeName: 'Tuyến mẫu 1',
        estimatedDuration: 20,
        distance: 5.0,
      },
    });

    // Tạo một vài waypoint
    const waypointsData = [
      { sequence: 1, latitude: 10.76292, longitude: 106.660236, stop_name: 'Điểm A' },
      { sequence: 2, latitude: 10.76300, longitude: 106.66021, stop_name: 'Điểm B' },
      { sequence: 3, latitude: 10.81532, longitude: 106.70294, stop_name: 'Điểm C' },
    ];

    for (const wp of waypointsData) {
      const wpId = `${routeId}_WP_${wp.sequence}`;
      await RouteWaypoint.findOrCreate({
        where: { id: wpId },
        defaults: {
          id: wpId,
          route_id: routeId,
          sequence: wp.sequence,
          latitude: wp.latitude,
          longitude: wp.longitude,
          stop_name: wp.stop_name,
          is_stop: true,
        },
      });
    }

    // Tạo user + driver
    await User.findOrCreate({
      where: { id: userDriverId },
      defaults: {
        id: userDriverId,
        username: 'driver_sample',
        password: 'password',
        email: 'driver_sample@example.com',
        role: 'DRIVER',
      },
    });

    await Driver.findOrCreate({
      where: { id: driverId },
      defaults: {
        id: driverId,
        fullName: 'Tài xế mẫu',
        phone: '0123456789',
        licenseNumber: `LN_${Math.floor(Math.random()*10000)}`,
        status: 'ACTIVE',
        current_bus_id: null,
        userId: userDriverId,
      },
    });

    // Tạo bus và gán route + driver
    await Bus.findOrCreate({
      where: { id: busId },
      defaults: {
        id: busId,
        license_plate: 'B001',
        capacity: 40,
        status: 'ACTIVE',
        speed: 30,
        route_id: routeId,
        driver_id: driverId,
        current_location_id: null,
      },
    });

    console.log('✅ Dữ liệu mẫu đã được tạo (hoặc đã tồn tại).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
