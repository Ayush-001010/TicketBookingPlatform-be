import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const RailwayStationTable = sequelize.define("RailwayStationTable", {
  ID: {
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  StationName: DataTypes.STRING,
  PlaceName: DataTypes.STRING,
  PlaceType: DataTypes.STRING,
  IsHillStation:DataTypes.BOOLEAN,
  NoOfPlatform : DataTypes.INTEGER,
  RailwayZone : DataTypes.STRING
});

export default RailwayStationTable;
