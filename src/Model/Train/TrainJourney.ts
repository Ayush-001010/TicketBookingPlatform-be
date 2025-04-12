import sequelize from "../dbConfig";
import { DataTypes } from "sequelize";

const TrainJourney = sequelize.define('TrainJourney',{
    ID : {
        primaryKey:true,
        autoIncrement:true,
        type:DataTypes.INTEGER
    },
    TrainCode : DataTypes.STRING,
    PlaceName : DataTypes.STRING,
    Time : DataTypes.STRING,
    Distance : DataTypes.STRING,
    TrainStoppageTime : DataTypes.STRING,
})

export default TrainJourney;