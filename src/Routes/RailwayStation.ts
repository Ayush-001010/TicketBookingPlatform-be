import { getRailwayStation, getRailwayStationCardValues, getRailwayStationOptions, getRailwayStationWithFilter } from "../Controller/Master/RailwayStation";
const express = require("express");

const route = express.Router();

route.post("/getData", getRailwayStation);
route.post("/getDataWithFilter",getRailwayStationWithFilter);
route.post("/getOptions",getRailwayStationOptions);
route.post("/getCards",getRailwayStationCardValues);

export default route;