import sequelize from "./dbConfig";
import { DataTypes } from "sequelize";

const TrainFacilites = sequelize.define("TrainFacilites" , {
    ID : {
        primaryKey : true,
        autoIncrement:true,
        type:DataTypes.INTEGER
    },
    FacilitesName : DataTypes.STRING
})

export default TrainFacilites;