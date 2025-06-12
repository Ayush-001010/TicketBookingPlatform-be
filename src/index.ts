// src/index.ts
import express, { NextFunction, Request, Response } from "express";
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
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const server = http.createServer(app);
const port = 8000;
app.use(cookieParser());
app.use(bodyParser.json());

// const io = new Server(server, {
//   cors: {
//     origin: [/^https:\/\/ticket-booking-platform-fe\.vercel\.app$/, "http://localhost:3000", "http://localhost:5000"],
//     credentials: true
//   }
// });

const io = new Server(server, {
  cors: {
    origin: "https://ticket-booking-platform-fe.vercel.app", // Base domain only
    credentials: true
  }
});



// app.use(cors({
//   origin: [
//     /^https:\/\/ticket-booking-platform-fe\.vercel\.app$/,  // Correct regex format
//     "http://localhost:5000"
//   ],
//   credentials: true
// }));

app.use(cors({
  origin: [
    "https://ticket-booking-platform-fe.vercel.app", // Correct Vercel frontend domain
    "http://localhost:5000" // Local backend for development
  ],
  credentials: true
}));


app.use("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.cookies, process.env.secretKey);
    const token = req.cookies.trainCookie;
    if (req.url.includes("authentication") || req.url.includes("bookTrainSeat") || jwt.verify(token || "", process.env.secretKey || "")) {
      next();
    } else {
      res.send({ success: false });
    }
  } catch(error){
    res.send({success : false});
  }
})

io.on("connection", (client) => {
  console.log("Hey I am speaking from client!!");

  // Correctly listen for the train-details event within the connection event
  client.on("train-details", async (message) => {
    console.log("Received train details: ", message);
    const res = await getAvailabilityOfSeats(message.trainCode, message.journeyDate, message.DepartureStation, message.DestinationStation)
    console.log("Response ", res);
    client.emit("train-details-data", { trainCode: message.trainCode, response: res });
  });
});

// app.use(
//   cors({
//     credentials: true,
//     origin: "*",
//   })
// );

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
    }).catch((error) => {
      console.log("Ohh shit something went wrong!!!   ", error);
    });
  console.log(`Server is running at http://localhost:${port}`);
});
