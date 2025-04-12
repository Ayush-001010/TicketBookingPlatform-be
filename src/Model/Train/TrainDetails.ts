import sequelize from "../dbConfig";
import {  DataTypes } from "sequelize";

const TrainDetails = sequelize.define('TrainDetails' , {
    ID : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    TrainName : DataTypes.STRING,
    TrainCode : DataTypes.STRING,
    DepartureStation : DataTypes.STRING,
    DestinationStation : DataTypes.STRING,
    TypeOfTrain : DataTypes.STRING,
    TypeOfCoachs : DataTypes.STRING,
    RunningSchedule : DataTypes.STRING,
    RunningDay : DataTypes.STRING,
})

export default TrainDetails;