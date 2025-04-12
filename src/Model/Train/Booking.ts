import sequelize from "../dbConfig";
import { DataTypes } from "sequelize";

const Booking = sequelize.define('Booking',{
    ID : {
        primaryKey : true,
        type:DataTypes.INTEGER,
        autoIncrement:true
    },
    userEmail : DataTypes.STRING,
    userPhoneNumber : DataTypes.STRING,
    TotalNoOfPassanger : DataTypes.STRING,
    TotalNoOfKids : DataTypes.STRING,
    TotalNoOfAdult : DataTypes.STRING,
    TotalNoOfSeniorCitezen : DataTypes.STRING,
    personNames : DataTypes.STRING,
    personAge : DataTypes.STRING,
    personGenders : DataTypes.STRING,
})

export default Booking;