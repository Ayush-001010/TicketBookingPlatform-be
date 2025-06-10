import {
  addNewTrain,
  bookingTicket,
  checkingTrainCodeExistOrNot,
  getMasterDetails,
  getParticularTrainCoachDetails,
  getPriceOfTrainSeat,
  getPriceOfTrainSeats,
  getTrainFilterOption,
  getTrainOptions,
  getTrains,
  makePayment,
  tatkalBooking,
} from "../Controller/Master/TrainDetails";

const express = require("express");

const route = express.Router();

route.post("/getOptions", getTrainOptions);
route.post("/getMasterDetails", getMasterDetails);
route.post("/addNewTrain",addNewTrain);
route.post("/getTrains",getTrains);
route.post("/filterOption",getTrainFilterOption);
route.post("/getPrice",getPriceOfTrainSeats);
route.post("/checkTrainCodeExistOrNot", checkingTrainCodeExistOrNot);
route.post("/getParticularTrainCoachDetails" , getParticularTrainCoachDetails);
route.post("/getPriceOfTrainSeat" , getPriceOfTrainSeat);
route.post("/makePayment" , makePayment);
route.post("/bookTrainSeat",bookingTicket);
route.post("/tatkalBooking" , tatkalBooking);

export default route;
