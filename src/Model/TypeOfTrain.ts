import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const TypeOfTrain = sequelize.define("TypeOfTrain", {
  ID: {
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  TrainType: DataTypes.STRING,
});

export default TypeOfTrain;
