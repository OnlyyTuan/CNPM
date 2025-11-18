import React, { useEffect, useState } from "react";
import parentApi from "../../api/parentApi";
import { toast } from "react-hot-toast";

const ParentList = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await parentApi.getAllParents();
      // api returns full response or response.data in some places; handle both
      const data = res?.data ?? res;
      setParents(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error("Failed to load parents", err);
      toast.error("Không thể tải danh sách phụ huynh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xoá phụ huynh này?")) return;
    try {
      await parentApi.deleteParent(id);
      toast.success("Xoá thành công");
      fetchParents();
    } catch (err) {
      console.error("Delete parent failed", err);
      toast.error("Xoá thất bại");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Phụ huynh</h3>
        <div>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded mr-2"
            onClick={fetchParents}
          >
            Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Tên
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Liên hệ
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parents.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{p.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {p.full_name || p.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {p.parent_contact || p.phone || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {p.email || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                      onClick={() => alert(JSON.stringify(p, null, 2))}
                    >
                      Xem
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(p.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentList;
