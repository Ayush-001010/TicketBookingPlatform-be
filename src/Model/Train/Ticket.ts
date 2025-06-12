import sequelize from "../dbConfig";
import { DataTypes } from "sequelize";

const Ticket = sequelize.define('Ticket',{
    ID : {
        primaryKey : true,
        type : DataTypes.INTEGER,
        autoIncrement : true 
    },
    TrainCode : DataTypes.STRING,
    TrainName : DataTypes.STRING,
    JourneyDate : DataTypes.DATE,
    CoachType : DataTypes.STRING,
    CoachNumber : DataTypes.STRING,
    SeatNumber : DataTypes.INTEGER,
    PassengerName : DataTypes.STRING,
    PassengerAge : DataTypes.STRING,
    PassengerPhoneNumber : DataTypes.STRING,
    PassengerCategory : DataTypes.STRING,
    PassengerGender : DataTypes.STRING,
    Price : DataTypes.DECIMAL,
    DepartureStation : DataTypes.STRING,
    DestinationStation : DataTypes.STRING,
    DepartureTime : DataTypes.STRING,
    DestinationTime : DataTypes.STRING,
    isBooked : DataTypes.BOOLEAN,
    DepartureDistance : DataTypes.DECIMAL,
    DestinationDistance : DataTypes.DECIMAL,
    userEmail : DataTypes.STRING
})

export default Ticket;