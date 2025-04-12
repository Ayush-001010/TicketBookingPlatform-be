import sequelize from "../dbConfig";
import { DataTypes } from "sequelize";

const Availability = sequelize.define('Availability',{
    ID : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true 
    },
    TrainCode : DataTypes.STRING,
    CoachType : DataTypes.STRING,
    Seats : DataTypes.STRING,
    JourneyDate : DataTypes.DATE,
    PlaceName : DataTypes.STRING,
})

export default Availability;