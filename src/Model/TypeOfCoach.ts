import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const TypeOfCoach = sequelize.define("TypeOfCoach", {
  ID: {
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  Coach: DataTypes.STRING,
});

export default TypeOfCoach;
