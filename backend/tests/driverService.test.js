const transactionObj = { commit: jest.fn(), rollback: jest.fn() };

// Mock the db module that driverService requires
jest.mock("../src/db", () => {
  const Driver = {
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
  };
  const Bus = {
    findByPk: jest.fn(),
    update: jest.fn(),
  };
  const User = {
    findByPk: jest.fn(),
  };
  const sequelize = {
    transaction: jest.fn(async () => transactionObj),
  };
  return { sequelize, Driver, Bus, User };
});

const db = require("../src/db");
const driverService = require("../src/services/driverService");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("driverService.assignBusToDriver", () => {
  test("assigns a bus to a driver when both exist and bus has no driver", async () => {
    const driverId = 1;
    const busId = 10;

    db.Driver.findByPk.mockResolvedValue({
      id: driverId,
      current_bus_id: null,
    });
    db.Bus.findByPk.mockResolvedValue({ id: busId, driver_id: null });
    db.Driver.update.mockResolvedValue([1]);
    db.Bus.update.mockResolvedValue([1]);

    const res = await driverService.assignBusToDriver(driverId, busId);

    expect(db.sequelize.transaction).toHaveBeenCalled();
    expect(db.Driver.findByPk).toHaveBeenCalledWith(
      driverId,
      expect.objectContaining({ transaction: transactionObj })
    );
    expect(db.Bus.findByPk).toHaveBeenCalledWith(
      busId,
      expect.objectContaining({ transaction: transactionObj })
    );

    expect(db.Driver.update).toHaveBeenCalledWith(
      { current_bus_id: busId, status: "DRIVING" },
      expect.objectContaining({
        where: { id: driverId },
        transaction: transactionObj,
      })
    );

    expect(db.Bus.update).toHaveBeenCalledWith(
      { driver_id: driverId },
      expect.objectContaining({
        where: { id: busId },
        transaction: transactionObj,
      })
    );

    expect(transactionObj.commit).toHaveBeenCalled();
    expect(res).toHaveProperty("message");
  });

  test("unassigns bus when busId is null", async () => {
    const driverId = 2;
    const busId = null;

    db.Driver.findByPk.mockResolvedValue({ id: driverId, current_bus_id: 5 });
    db.Bus.findByPk.mockResolvedValue(null);
    db.Driver.update.mockResolvedValue([1]);

    const res = await driverService.assignBusToDriver(driverId, busId);

    expect(db.sequelize.transaction).toHaveBeenCalled();
    expect(db.Driver.update).toHaveBeenCalledWith(
      { current_bus_id: null, status: "OFF_DUTY" },
      expect.objectContaining({
        where: { id: driverId },
        transaction: transactionObj,
      })
    );

    expect(transactionObj.commit).toHaveBeenCalled();
    expect(res).toHaveProperty("message");
  });

  test("reassigns when bus already has another driver", async () => {
    const driverId = 3;
    const busId = 20;

    db.Driver.findByPk.mockResolvedValue({
      id: driverId,
      current_bus_id: null,
    });
    db.Bus.findByPk.mockResolvedValue({ id: busId, driver_id: 99 });
    db.Driver.update.mockResolvedValue([1]);
    db.Bus.update.mockResolvedValue([1]);

    const res = await driverService.assignBusToDriver(driverId, busId);

    // Should clear driver on old bus-driver relationship
    expect(db.Driver.update).toHaveBeenCalledWith(
      { current_bus_id: null, status: "OFF_DUTY" },
      expect.objectContaining({
        where: { id: 99 },
        transaction: transactionObj,
      })
    );

    // Should set current driver
    expect(db.Driver.update).toHaveBeenCalledWith(
      { current_bus_id: busId, status: "DRIVING" },
      expect.objectContaining({
        where: { id: driverId },
        transaction: transactionObj,
      })
    );

    expect(db.Bus.update).toHaveBeenCalledWith(
      { driver_id: driverId },
      expect.objectContaining({
        where: { id: busId },
        transaction: transactionObj,
      })
    );

    expect(transactionObj.commit).toHaveBeenCalled();
    expect(res).toHaveProperty("message");
  });
});
