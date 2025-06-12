export interface ITrainStops {
    placeName : string;
    time : string;
    distance : string;
    price:Record<string , string>;
    TrainStoppageTime : string;
    perKmPrice:any;
}

export interface ITrainDetails  {
    TrainName : string;
    TypeOfTrain : string;
    TypeOfCoach : Array<string>;
    DepartureStation : string;
    DestinationStation : string;
    TrainCode : string;
    RunningSchedule : string;
    RunningDay : Array<string>;
    stops : Array<ITrainStops>
    coaches:Array<Record<string , string>>;
}