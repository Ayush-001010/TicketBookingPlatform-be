import sequelize from "../dbConfig";
import { DataTypes } from "sequelize";

const State = sequelize.define('States' , {
    ID : {
        primaryKey : true , 
        autoIncrement:true,
        type:DataTypes.INTEGER
    },
    StateName : DataTypes.STRING,
    ActiveStations : DataTypes.INTEGER,
    InactiveStations : DataTypes.INTEGER,
    TerminalStations : DataTypes.INTEGER,
    CentralStations : DataTypes.INTEGER,
    JunctionStations : DataTypes.INTEGER,
    TotalStations : DataTypes.INTEGER
});

export default State;