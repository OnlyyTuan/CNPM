const db = require('../db');
const Route = db.Route;
const RouteWaypoint = db.RouteWaypoint;
const debug = require('debug')('app:route');

exports.getAllRoutes = async (req, res) => {
    try {
        debug('Getting all routes...');
        console.log('Route model:', Route);
        const routes = await Route.findAll();
        debug('Routes found:', routes);
        res.json(routes);
    } catch (error) {
        debug('Error getting routes:', error);
        console.error('Detailed error:', error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách tuyến đường", error: error.message });
    }
};

exports.getRouteById = async (req, res) => {
    try {
        const route = await Route.findByPk(req.params.id);
        if (!route) {
            return res.status(404).json({ message: "Không tìm thấy tuyến đường" });
        }
        res.json(route);
    } catch (error) {
        debug('Error getting route:', error);
        res.status(500).json({ message: "Lỗi khi lấy thông tin tuyến đường" });
    }
};

exports.createRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);
        res.status(201).json(route);
    } catch (error) {
        debug('Error creating route:', error);
        res.status(500).json({ message: "Lỗi khi tạo tuyến đường" });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const route = await Route.findByPk(req.params.id);
        if (!route) {
            return res.status(404).json({ message: "Không tìm thấy tuyến đường" });
        }
        await route.update(req.body);
        res.json(route);
    } catch (error) {
        debug('Error updating route:', error);
        res.status(500).json({ message: "Lỗi khi cập nhật tuyến đường" });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByPk(req.params.id);
        if (!route) {
            return res.status(404).json({ message: "Không tìm thấy tuyến đường" });
        }
        await route.destroy();
        res.json({ message: "Đã xóa tuyến đường thành công" });
    } catch (error) {
        debug('Error deleting route:', error);
        res.status(500).json({ message: "Lỗi khi xóa tuyến đường" });
    }
};

// Lấy waypoints của route (cho vẽ lộ trình trên bản đồ)
exports.getRouteWaypoints = async (req, res) => {
    try {
        console.log('🗺️ getRouteWaypoints được gọi với ID:', req.params.id);
        const { id } = req.params;
        
        // Kiểm tra route có tồn tại không
        const route = await Route.findByPk(id);
        if (!route) {
            console.log('❌ Không tìm thấy route với ID:', id);
            return res.status(404).json({ message: "Không tìm thấy tuyến đường" });
        }
        
        console.log('✅ Tìm thấy route:', route.routeName);
        
        // Lấy tất cả waypoints theo thứ tự sequence
        const waypoints = await RouteWaypoint.findAll({
            where: { route_id: id },
            order: [['sequence', 'ASC']],
            attributes: ['id', 'sequence', 'latitude', 'longitude', 'stop_name', 'is_stop']
        });
        
        console.log(`✅ Tìm thấy ${waypoints.length} waypoints`);
        
        res.json({
            routeId: id,
            routeName: route.routeName,
            waypoints
        });
    } catch (error) {
        console.error('❌ Error getting route waypoints:', error);
        res.status(500).json({ message: "Lỗi khi lấy lộ trình" });
    }
};