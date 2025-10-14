const db = require("./db");

async function seed() {
  try {
    // Locations
    await db.query(
      "INSERT INTO Location (id,name,address,latitude,longitude,type,estimatedTime) VALUES ('L1','School A','Hanoi',21.0285,105.8542,'SCHOOL','07:00:00')"
    );
    await db.query(
      "INSERT INTO Location (id,name,address,latitude,longitude,type,estimatedTime) VALUES ('L2','Pickup 1','Hanoi',21.0300,105.8550,'PICKUP_POINT','07:10:00')"
    );

    // Drivers
    await db.query(
      "INSERT INTO Driver (id,name,phone,licenseNumber,experience,status,currentBus_id) VALUES ('D1','Nguyen Van A','0901234567','L123','5','OFF_DUTY',NULL)"
    );

    // Buses
    await db.query(
      "INSERT INTO Bus (id,capacity,currentLocation_id,status,speed,lastUpdate,route_id,driver_id) VALUES ('B1',30,'L1','ACTIVE',0,NOW(),NULL,'D1')"
    );

    // Students
    await db.query(
      "INSERT INTO Student (id,name,class,grade,parentContact,status,assignedBus_id,pickupLocation_id,dropoffLocation_id) VALUES ('S1','Tran Van B','1A',1,'0901111111','WAITING','B1','L2','L1')"
    );

    console.log("Seed data completed!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
