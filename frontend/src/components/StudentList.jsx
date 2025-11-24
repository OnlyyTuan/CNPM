// frontend/src/components/StudentList.jsx
import { useEffect, useState } from "react";
import { getAllStudents } from "../api/studentApi";
import { onEntityChange } from "../utils/eventBus";

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllStudents();
        // handle both { success,data } and raw array
        const data = res && res.data ? res.data : res;
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    load();

    const unsubscribe = onEntityChange(({ entity }) => {
      if (entity === "student" || entity === "bus") {
        load();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Danh sách học sinh</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id} className="mb-2">
            <div className="font-medium">
              {student.full_name || student.name}{" "}
              <span className="text-sm text-gray-500">(ID: {student.id})</span>
            </div>
            <div className="text-sm text-gray-600">
              Lớp: {student.class} • Trạng thái: {student.status}
            </div>
            {student.address && (
              <div className="text-sm text-gray-700">
                Địa chỉ: {student.address}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
