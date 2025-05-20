import { addStation, editStation, getState, getStationCardValues, getStations, searchStation } from "../Controller/Master/RailwayDetails";

const express = require("express");

const route = express.Router();

route.post("/getState" , getState);
route.post("/getStation" , getStations);
route.post("/addStation" , addStation);
route.post("/editStation" , editStation);
route.post("/getStationCardValues" , getStationCardValues);
route.post("/search" , searchStation);

export default route;