import { addStation, editStation, getState, getStations } from "../Controller/Master/RailwayDetails";

const express = require("express");

const route = express.Router();

route.post("/getState" , getState);
route.post("/getStation" , getStations);
route.post("/addStation" , addStation);
route.post("/editStation" , editStation);

export default route;