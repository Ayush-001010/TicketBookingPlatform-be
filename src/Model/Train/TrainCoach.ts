import exp from "constants";
import sequelize from "../dbConfig";
import { DataTypes } from "sequelize";

const TrainCoach = sequelize.define('TrainCoachs',{
    ID : {
        primaryKey : true,
        autoIncrement:true,
        type:DataTypes.INTEGER
    },
    TrainCode : DataTypes.STRING,
    CoachName : DataTypes.STRING,
    PerCabinSheats : DataTypes.STRING,
    TotalCabin : DataTypes.STRING,
    PerKmPrice : DataTypes.DECIMAL,
})

export default TrainCoach;