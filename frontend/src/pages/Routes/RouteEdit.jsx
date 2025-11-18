import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getRouteById, updateRoute } from "../../api/routeApi";

const RouteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getRouteById(id);
        // API may return wrapped object or array — normalize
        const payload = data && data.data ? data.data : data;
        setRoute(
          payload || { id, route_name: "", distance: 0, estimated_duration: 0 }
        );
      } catch (err) {
        console.error(err);
        toast.error("Không tải được thông tin tuyến");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (field) => (e) => {
    setRoute((r) => ({ ...r, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        route_name: route.route_name,
        distance: Number(route.distance) || 0,
        estimated_duration: Number(route.estimated_duration) || 0,
      };
      await updateRoute(id, payload);
      toast.success("Cập nhật tuyến thành công");
      // Notify other parts of the app that routes changed so they can refresh
      try {
        window.dispatchEvent(
          new CustomEvent("routes:updated", { detail: { id } })
        );
      } catch (e) {
        // older browsers may fail, ignore
      }
      navigate("/admin/routes");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!route) return <div>Không tìm thấy tuyến</div>;

  return (
    <div className="max-w-xl bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Sửa tuyến {route.id}</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Tên tuyến</label>
          <input
            value={route.route_name || ""}
            onChange={handleChange("route_name")}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">
            Quãng đường (km)
          </label>
          <input
            value={route.distance ?? ""}
            onChange={handleChange("distance")}
            type="number"
            step="0.1"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">
            Thời gian ước tính (phút)
          </label>
          <input
            value={route.estimated_duration ?? ""}
            onChange={handleChange("estimated_duration")}
            type="number"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default RouteEdit;
