import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const RunningScheduleTable = sequelize.define("RunningScheduleTable", {
  ID: {
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  Schedule : DataTypes.STRING
});

export default RunningScheduleTable;
