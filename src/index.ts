// src/index.ts
import express from "express";
import sequelize from "./Model/dbConfig";
import authenticationRoutes from "./Routes/authentication";
import railwayStationRoutes from "./Routes/RailwayStation";
import passengerDetailsRoutes from "./Routes/PassengerDetails";
import trainRoutes from "./Routes/Train";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { getAvailabilityOfSeats } from "./Controller/Master/TrainDetails";

const app = express();
const server = http.createServer(app);
const port = 8000;
app.use(bodyParser.json());

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (client) => {
  console.log("Hey I am speaking from client!!");

  // Correctly listen for the train-details event within the connection event
  client.on("train-details",async  (message) => {
    console.log("Received train details: ", message);
    const res = await getAvailabilityOfSeats(message.trainCode,message.journeyDate , message.DepartureStation,message.DestinationStation)
    console.log("Response ",res);
    client.emit("train-details-data" , {trainCode : message.trainCode , response : res});
  });
});

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript!");
});
app.use("/authentication", authenticationRoutes);
app.use("/stations", railwayStationRoutes);
app.use("/train", trainRoutes);
app.use("/passengerDetails", passengerDetailsRoutes);

server.listen(port, () => {
  sequelize
    .sync()
    .then(() => {
      console.log("Everything working fine!!!");
    })    .catch((error) => {
      console.log("Ohh shit something went wrong!!!   ",error);
    });
  console.log(`Server is running at http://localhost:${port}`);
});
