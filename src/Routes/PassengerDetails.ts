import { cardsData, dayByDayJourneyDetails, trainJourneyDetails, trainTicketsDetails } from "../Controller/Master/PassengerJourney";

const express = require("express");

const route = express.Router();

route.post("/getCardValues" , cardsData);
route.post("/dayByDayDetails", dayByDayJourneyDetails );
route.post("/trainJourney" , trainJourneyDetails);
route.post("/ticket" , trainTicketsDetails)

export default route;