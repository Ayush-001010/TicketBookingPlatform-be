import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const userMasterTable = sequelize.define("UserMasterTable", {
  ID: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    autoIncrement:true
  },
  UserEmail: DataTypes.STRING,
  UserName: DataTypes.STRING,
  IsAdmin : DataTypes.BOOLEAN,
  UserPassword : DataTypes.STRING
});

export default userMasterTable;