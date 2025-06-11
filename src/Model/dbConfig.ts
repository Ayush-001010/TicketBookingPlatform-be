import { Sequelize } from "sequelize";
import * as dotenv from 'dotenv';

dotenv.config();
// const sequelize = new Sequelize('ticketBooking','root','Ayush@10',{
//     host:"localhost",
//     dialect:"mysql"
// })


const sequelize = new Sequelize( process.env.dbName || 'your_database', process.env.dbName || "default_db_name" , process.env.dbPassword || 'your_password', {
    host: 'sql12.freesqldatabase.com', // Use the provided host
    dialect: 'mysql',
    port:3306
});

export default sequelize;