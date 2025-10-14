import LocationList from "./components/LocationList";
import BusList from "./components/BusList";
import DriverList from "./components/DriverList";
import StudentList from "./components/StudentList";
import RouteList from "./components/RouteList";
import ScheduleList from "./components/ScheduleList";

function App() {
  return (
    <div>
      <h1>Smart School Bus</h1>
      <LocationList />
      <BusList />
      <DriverList />
      <StudentList />
      <RouteList />
      <ScheduleList />
    </div>
  );
}

export default App;
