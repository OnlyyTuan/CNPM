import { useState, useEffect } from "react";
// Nếu bạn sử dụng thư viện axios, hãy 'npm install axios' và import ở đây:
// import axios from 'axios';

function LocationList() {
  // 1. Dùng useState để lưu trạng thái dữ liệu
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Dùng useEffect để gọi API khi component được tải (lần đầu tiên)
  useEffect(() => {
    // Hàm bất đồng bộ (async) để gọi API
    const fetchLocations = async () => {
      try {
        //  địa chỉ backend thực tế của bạn
        const response = await fetch("http://localhost:3000/locations");

        // Kiểm tra nếu response không thành công (ví dụ: lỗi 404, 500)
        if (!response.ok) {
          throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Cập nhật trạng thái (state) với dữ liệu nhận được
        setLocations(data);
        setError(null); // Xóa lỗi nếu có
      } catch (err) {
        // Xử lý lỗi trong quá trình fetch (ví dụ: backend chưa chạy)
        console.error("Lỗi khi tải dữ liệu vị trí:", err);
        setError("Không thể tải dữ liệu. Đảm bảo Backend đã chạy.");
      } finally {
        // Luôn đặt loading thành false sau khi fetch xong
        setLoading(false);
      }
    };

    fetchLocations();
  }, []); // Mảng rỗng đảm bảo hàm chỉ chạy 1 lần sau khi render ban đầu

  // 3. Hiển thị trạng thái tải và lỗi
  if (loading) {
    return <h2>Đang tải danh sách điểm...</h2>;
  }

  if (error) {
    return <h2 style={{ color: "red" }}>LỖI: {error}</h2>;
  }

  // 4. Hiển thị dữ liệu
  return (
    <div>
      <h2>Danh sách điểm</h2>
      {/* Kiểm tra nếu danh sách rỗng */}
      {locations.length === 0 ? (
        <p>Không có vị trí nào được tìm thấy.</p>
      ) : (
        <ul>
          {locations.map((loc) => (
            <li key={loc.id}>
              <strong>{loc.name}</strong> - {loc.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationList;
