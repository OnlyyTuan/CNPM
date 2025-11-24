// check-buses-routes.js - Kiểm tra xe bus và tuyến đường
const db = require('./src/db');

async function checkBusesAndRoutes() {
  try {
    console.log('🚌 Đang kiểm tra xe bus và tuyến đường...\n');
    
    const buses = await db.Bus.findAll({
      where: {
        route_id: { [db.Sequelize.Op.ne]: null }
      },
      include: [
        {
          model: db.Route,
          as: 'CurrentRoute',
          attributes: ['id', 'route_name']
        }
      ],
      order: [['route_id', 'ASC'], ['id', 'ASC']],
      raw: false
    });
    
    console.log('📊 Các xe đã được phân công tuyến:\n');
    
    const tableData = buses.map(bus => ({
      id: bus.id,
      license_plate: bus.license_plate,
      route_id: bus.route_id,
      route_name: bus.CurrentRoute ? bus.CurrentRoute.route_name : 'N/A',
      status: bus.status
    }));
    
    console.table(tableData);
    
    // Đếm xe theo tuyến
    const routeCounts = {};
    buses.forEach(bus => {
      if (!routeCounts[bus.route_id]) {
        routeCounts[bus.route_id] = {
          route_id: bus.route_id,
          route_name: bus.route_name,
          count: 0,
          buses: []
        };
      }
      routeCounts[bus.route_id].count++;
      routeCounts[bus.route_id].buses.push(bus.id);
    });
    
    console.log('\n📈 Thống kê xe theo tuyến:\n');
    Object.values(routeCounts).forEach(route => {
      console.log(`${route.route_id} (${route.route_name}): ${route.count} xe - ${route.buses.join(', ')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

checkBusesAndRoutes();
