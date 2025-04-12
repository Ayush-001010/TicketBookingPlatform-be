import {
  addNewTrain,
  checkingTrainCodeExistOrNot,
  getMasterDetails,
  getPriceOfTrainSeats,
  getTrainFilterOption,
  getTrainOptions,
  getTrains,
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

export default route;
