// frontend/src/components/Students/AddStudentModal.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AddStudentModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: "",
    full_name: "",
    class: "",
    grade: "",
    parent_contact: "",
    assigned_bus_id: "",
    pickup_location_id: "",
    dropoff_location_id: "",
  });

  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  // Cập nhật form khi có initialData (chế độ sửa)
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        full_name: initialData.full_name || "",
        class: initialData.class || "",
        grade: initialData.grade || "",
        parent_contact: initialData.parent_contact || "",
        assigned_bus_id: initialData.assigned_bus_id || "",
        pickup_location_id: initialData.pickup_location_id || "",
        dropoff_location_id: initialData.dropoff_location_id || "",
      });
    } else {
      setFormData({
        id: `STU${Date.now()}`,
        full_name: "",
        class: "",
        grade: "",
        parent_contact: "",
        assigned_bus_id: "",
        pickup_location_id: "",
        dropoff_location_id: "",
      });
    }
  }, [initialData, isOpen]);

  // Fetch buses and locations when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [busesRes, locationsRes] = await Promise.all([
          axios.get("http://localhost:3000/api/v1/buses"),
          axios.get("http://localhost:3000/api/v1/routes/locations"),
        ]);

        if (busesRes.data && busesRes.data.data) setBuses(busesRes.data.data);
        else if (Array.isArray(busesRes.data)) setBuses(busesRes.data);

        // keep full list of locations so we can show them when no bus selected
        let locs = [];
        if (locationsRes.data && locationsRes.data.data)
          locs = locationsRes.data.data;
        else if (Array.isArray(locationsRes.data)) locs = locationsRes.data;
        setAllLocations(locs);
        console.log("[AddStudentModal] allLocations loaded:", locs.length);

        // If editing and there's an assigned bus, fetch its stops so selects are limited
        if (initialData && initialData.assigned_bus_id) {
          console.log(
            `[AddStudentModal] initialData has assigned_bus_id=${initialData.assigned_bus_id}`
          );
          // load stops for this bus
          const stops = await fetchStops(initialData.assigned_bus_id);

          // ensure existing pickup/dropoff from initialData are present in locations
          (async () => {
            const needIds = [];
            if (initialData.pickup_location_id)
              needIds.push(initialData.pickup_location_id);
            if (initialData.dropoff_location_id)
              needIds.push(initialData.dropoff_location_id);

            // find missing ids in the current stops
            const missingIds = needIds.filter(
              (id) => !stops.find((c) => String(c.id) === String(id))
            );

            // start with the stops we have
            let finalList = Array.isArray(stops) ? [...stops] : [];

            if (missingIds.length > 0) {
              // try to find missing full objects from the all-locations list we received earlier
              const found = missingIds
                .map((id) => locs.find((l) => String(l.id) === String(id)))
                .filter(Boolean);
              finalList = [...finalList, ...found];

              // if still not found, try fetching full locations list from server as a fallback
              if (found.length < missingIds.length) {
                try {
                  const fullRes = await axios.get(
                    "http://localhost:3000/api/v1/routes/locations"
                  );
                  const fullList =
                    fullRes.data && fullRes.data.data
                      ? fullRes.data.data
                      : Array.isArray(fullRes.data)
                      ? fullRes.data
                      : [];
                  const found2 = missingIds
                    .map((id) =>
                      fullList.find((l) => String(l.id) === String(id))
                    )
                    .filter(Boolean);
                  finalList = [...finalList, ...found2];
                } catch (err) {
                  // fallback: do nothing more
                }
              }
            }

            setLocations(finalList);
          })();
        } else {
          // show all locations until a bus is selected
          setLocations(locs);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách xe buýt/điểm dừng:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  // Fetch stops for a given bus and set locations
  // fetch stops for a given bus and optionally set locations state
  // skipSet = true -> return stops array but do not call setLocations
  const fetchStops = async (busId, skipSet = false) => {
    if (!busId) {
      // if no bus selected, show all available locations
      if (!skipSet) setLocations(allLocations || []);
      return allLocations || [];
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/students/bus/${busId}/stops`
      );
      console.log(
        `[AddStudentModal] fetchStops(${busId}) response:`,
        res && res.data
      );
      const stops =
        res.data && res.data.data
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
      if (!skipSet) setLocations(stops);
      return stops;
    } catch (err) {
      console.error("Lỗi khi tải stops của bus:", err);
      // on error, fall back to showing all locations
      if (!skipSet) setLocations(allLocations || []);
      return allLocations || [];
    }
  };

  // Ensure stops are loaded when assigned_bus_id changes (covers edit mode)
  useEffect(() => {
    if (formData.assigned_bus_id) {
      // load stops for this bus
      fetchStops(formData.assigned_bus_id);
    } else {
      // no bus selected => show all
      setLocations(allLocations || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.assigned_bus_id]);

  const handleAssignedBusChange = (value) => {
    const newBusId = value;

    // Immediately set assigned_bus_id so the select reflects the user's choice
    setFormData((prev) => ({ ...prev, assigned_bus_id: newBusId }));

    // fetch stops but do not set UI until user confirms
    (async () => {
      // capture previous form values for validation (pickup/dropoff)
      const prev = { ...formData };

      let stops = await fetchStops(newBusId, true);

      // If backend returns no stops for this bus (data mismatch), fall back to allLocations
      if (
        (!stops || stops.length === 0) &&
        allLocations &&
        allLocations.length > 0
      ) {
        // include existing selected pickup/dropoff so they remain visible
        const prevIds = [
          formData.pickup_location_id,
          formData.dropoff_location_id,
        ].filter(Boolean);
        const appended = allLocations.filter((l) =>
          prevIds.includes(String(l.id))
        );
        // merge unique
        const map = {};
        const merged = [];
        (stops || []).concat(allLocations || [], appended).forEach((s) => {
          if (!s || !s.id) return;
          if (!map[String(s.id)]) {
            map[String(s.id)] = true;
            merged.push(s);
          }
        });
        stops = merged;
      }

      // check if current pickup/dropoff belong to the new stops (use prev values)
      const pickupValid =
        !prev.pickup_location_id ||
        stops.some((s) => s.id === prev.pickup_location_id);
      const dropoffValid =
        !prev.dropoff_location_id ||
        stops.some((s) => s.id === prev.dropoff_location_id);

      // By default keep previous pickup/dropoff; only clear them if user confirms
      let newForm = { ...prev, assigned_bus_id: newBusId };

      if (!pickupValid || !dropoffValid) {
        const confirmClear = window.confirm(
          "Xe buýt này không có điểm đón/trả đã chọn. Bạn có muốn xóa các điểm không hợp lệ?"
        );
        if (confirmClear) {
          if (!pickupValid) newForm.pickup_location_id = null;
          if (!dropoffValid) newForm.dropoff_location_id = null;

          // user confirmed clearing -> update locations to the stops for the new bus
          // (if stops is empty, fallback logic earlier already merged allLocations)
          setLocations(stops);
          setFormData(newForm);
        } else {
          // user chose to keep invalid pickup/dropoff: do not change locations
          // formData already had assigned_bus_id set above; keep pickup/dropoff
          // unchanged so they remain visible
          // No further action required
        }
      } else {
        // Both valid -> update locations and form to reflect new bus
        setLocations(stops);
        setFormData(newForm);
      }
    })();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "assigned_bus_id") {
      // handle async bus change
      handleAssignedBusChange(value);
      return;
    }

    // Default case: update single field
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload
    let submitData = initialData
      ? {
          ...formData,
          status: formData.status || "WAITING",
        }
      : {
          ...formData,
          id: formData.id || `S${Date.now()}`,
          status: "WAITING",
        };

    // Note: do not unconditionally clear pickup/dropoff when assigned bus changed.
    // The assigned-bus change handler already asks the user and updates formData
    // accordingly. We still perform validation below to avoid submitting invalid ids.

    // If we've got an assigned bus but no locations loaded yet, try to fetch them
    if (submitData.assigned_bus_id && (!locations || locations.length === 0)) {
      const loaded = await fetchStops(submitData.assigned_bus_id);
      if (loaded && loaded.length > 0) setLocations(loaded);
    }

    // Additionally, ensure any pickup/dropoff being submitted actually exist in
    // the current `locations` list (stops for the selected bus).
    const locIds = (locations || []).map((l) => String(l.id));
    const pickupInvalid =
      submitData.pickup_location_id &&
      !locIds.includes(String(submitData.pickup_location_id));
    const dropoffInvalid =
      submitData.dropoff_location_id &&
      !locIds.includes(String(submitData.dropoff_location_id));

    if (pickupInvalid || dropoffInvalid) {
      // If we have location data to validate against, clear invalids and notify.
      if (locations && locations.length > 0) {
        if (pickupInvalid) submitData.pickup_location_id = "";
        if (dropoffInvalid) submitData.dropoff_location_id = "";
        // reflect cleared values in the form UI before submitting
        setFormData((prev) => ({
          ...prev,
          pickup_location_id: submitData.pickup_location_id,
          dropoff_location_id: submitData.dropoff_location_id,
        }));
        toast(
          "Đã xóa điểm đón/trả không hợp lệ cho tuyến đã chọn. Vui lòng chọn lại nếu cần.",
          { icon: "⚠️" }
        );
      } else {
        // No location data to validate against (ambiguous) — block submission
        toast.error(
          "Không thể xác minh điểm đón/trả với tuyến đã chọn. Vui lòng kiểm tra lại trước khi lưu."
        );
        return;
      }
    }

    console.log("[AddStudentModal] submitData ->", submitData);

    onSubmit(submitData);

    // Reset form after creation
    if (!initialData) {
      setFormData({
        id: `STU${Date.now()}`,
        full_name: "",
        class: "",
        grade: "",
        parent_contact: "",
        assigned_bus_id: "",
        pickup_location_id: "",
        dropoff_location_id: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "Chỉnh sửa Học sinh" : "Thêm Học sinh mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tên học sinh *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Nhập tên học sinh"
            />
          </div>

          {/* Hiển thị Mã học sinh (có thể sửa) */}
          <div className="form-group">
            <label>Mã học sinh</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              placeholder="Ví dụ: STU123456789"
            />
            <small className="text-gray-500">
              Mã sẽ được gửi kèm khi tạo học sinh
            </small>
          </div>

          <div className="form-group">
            <label>Lớp *</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              placeholder="Ví dụ: 10A1"
            />
          </div>

          <div className="form-group">
            <label>Khối</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="Ví dụ: 10"
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại phụ huynh *</label>
            <input
              type="tel"
              name="parent_contact"
              value={formData.parent_contact}
              onChange={handleChange}
              required
              placeholder="Ví dụ: 0912345678"
            />
          </div>

          <div className="form-group">
            <label>Điểm đón (chọn từ danh sách)</label>
            <select
              name="pickup_location_id"
              value={formData.pickup_location_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn điểm đón --</option>
              {locations.length === 0 ? (
                <option value="" disabled>
                  Không có điểm dừng
                </option>
              ) : (
                locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.address ? `- ${loc.address}` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Điểm trả (chọn từ danh sách)</label>
            <select
              name="dropoff_location_id"
              value={formData.dropoff_location_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn điểm trả --</option>
              {locations.length === 0 ? (
                <option value="" disabled>
                  Không có điểm dừng
                </option>
              ) : (
                locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.address ? `- ${loc.address}` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Xe buýt (gán cho học sinh)</label>
            <select
              name="assigned_bus_id"
              value={formData.assigned_bus_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn xe buýt --</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || b.id} {b.plate_number ? `- ${b.plate_number}` : ""}
                </option>
              ))}
            </select>
            <small className="text-gray-500">
              Nếu không chọn, học sinh sẽ chưa được phân xe
            </small>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {initialData ? "Cập nhật" : "Thêm học sinh"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6c757d;
        }
        .modal-form {
          padding: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #343a40;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        .btn-cancel {
          padding: 10px 20px;
          border: 1px solid #6c757d;
          background-color: white;
          color: #6c757d;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-submit {
          padding: 10px 20px;
          border: none;
          background-color: #28a745;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AddStudentModal;
