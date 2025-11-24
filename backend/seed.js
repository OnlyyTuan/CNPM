const db = require("./src/db");
const { User, Location, Driver, Bus, Parent, Student } = db;

async function seed() {
  try {
    // Locations
    await Location.create({
      id: "L1",
      name: "School A",
      address: "Hanoi",
      latitude: 21.0285,
      longitude: 105.8542,
      type: "SCHOOL",
    });

    await Location.create({
      id: "L2",
      name: "Pickup 1",
      address: "Hanoi",
      latitude: 21.03,
      longitude: 105.855,
      type: "PICKUP_POINT",
    });

    // Create a user for driver first
    const driverUser = await User.create({
      id: "U1",
      username: "driver1",
      email: "driver1@example.com",
      password: "123456",
      role: "DRIVER",
    });

    // Drivers
    const driver = await Driver.create({
      id: "D1",
      full_name: "Nguyen Van A",
      phone: "0901234567",
      license_number: "L123",
      status: "OFF_DUTY",
      user_id: driverUser.id,
    });

    // Buses
    await Bus.create({
      id: "B1",
      license_plate: "51A-12345",
      capacity: 30,
      current_location_id: "L1",
      status: "ACTIVE",
      speed: 0,
      driver_id: driver.id,
    });

    // Create a user for parent
    const parentUser = await User.create({
      id: "U2",
      username: "parent1",
      email: "parent1@example.com",
      password: "123456",
      role: "PARENT",
    });

    // Parent
    const parent = await Parent.create({
      id: "P1",
      full_name: "Parent Name",
      phone: "0901111111",
      address: "Parent Address",
      user_id: parentUser.id,
    });

    // Students
    await Student.create({
      id: "S1",
      full_name: "Tran Van B",
      class: "1A",
      grade: 1,
      parent_id: parent.id,
    });

    console.log("Seed data completed!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
