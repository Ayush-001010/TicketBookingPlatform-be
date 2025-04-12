import { Sequelize } from "sequelize";

const sequelize = new Sequelize('ticketBooking','root','Ayush@10',{
    host:"localhost",
    dialect:"mysql"
})

export default sequelize;