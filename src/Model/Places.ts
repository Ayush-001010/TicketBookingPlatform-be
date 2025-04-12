import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const Places = sequelize.define("Places", {
  ID: {
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  PlaceName: DataTypes.STRING,
  State: DataTypes.STRING,
  Longitude: DataTypes.STRING,
  Latitude: DataTypes.STRING,
});

export default Places;
