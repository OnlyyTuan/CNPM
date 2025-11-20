// frontend/src/components/StudentList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/v1/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Danh sách học sinh</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.name} - Lớp: {student.class} - Trạng thái: {student.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
