import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const Places = sequelize.define("Places", {
  ID: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  PlaceName: DataTypes.STRING,
  State: DataTypes.STRING,
  Longitude: DataTypes.STRING,
  Latitude: DataTypes.STRING,
  City: DataTypes.STRING,
  NumberOfPlatforms : DataTypes.INTEGER,
  TypeOfStation: DataTypes.STRING,
  IsActive : DataTypes.BOOLEAN,
  Capacity : DataTypes.INTEGER,
});

export default Places;
