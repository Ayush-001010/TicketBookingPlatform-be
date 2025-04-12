import RailwayStationTable from "./RailwayStation";
import userMasterTable from "./userMasterTable";
import Places from "./Places";
import TypeOfCoach from "./TypeOfCoach";
import TypeOfTrain from "./TypeOfTrain";
import RunningScheduleTable from "./RunningSchedule";
import TrainDetails from "./Train/TrainDetails";
import TrainJourney from "./Train/TrainJourney";
import TrainCoach from "./Train/TrainCoach";
import TrainFacilites from "./TrainFacilites";
import Availability from "./Train/Availability";
import Booking from "./Train/Booking";

const model: Record<string, any> = {
  userMasterTable: userMasterTable,
  RailwayStationTable: RailwayStationTable,
  Places: Places,
  TypeOfCoach: TypeOfCoach,
  TypeOfTrain: TypeOfTrain,
  RunningScheduleTable: RunningScheduleTable,
  TrainDetails: TrainDetails,
  TrainJourney: TrainJourney,
  TrainCoach: TrainCoach,
  TrainFacilites : TrainFacilites,
  Availability : Availability,
  Booking : Booking
};

export default model;
