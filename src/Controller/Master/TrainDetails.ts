import { Request, Response } from "express";
import model from "../../Model/model";
import { ITrainDetails } from "../../Interface/CommonInterface";
import { Op, where } from "sequelize";

export const getTrainOptions = async (req: Request, res: Response) => {
  try {
    const typeOfTrainData = await model.TypeOfTrain.findAll({
      attributes: ["TrainType"],
    });
    const typeOfCoachData = await model.TypeOfCoach.findAll({
      attributes: ["Coach"],
    });
    const placesData = await model.Places.findAll({
      attributes: ["PlaceName"],
    });
    const runningData = await model.RunningScheduleTable.findAll({
      attributes: ["Schedule"],
    });

    return res.send({
      success: true,
      data: { typeOfTrainData, typeOfCoachData, placesData, runningData },
    });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false, error: "Something Went Wrong" });
  }
};

export const getMasterDetails = async (req: Request, res: Response) => {
  try {
    const { tableName } = req.body;
    const tableData = await model[tableName].findAll();
    return res.send({ success: true, data: tableData });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};

export const addNewTrain = async (req: Request, res: Response) => {
  try {
    const {
      TrainCode,
      TrainName,
      DepartureStation,
      DestinationStation,
      TypeOfTrain,
      TypeOfCoach,
      RunningSchedule,
      RunningDay,
      stops,
      coaches,
    }: ITrainDetails = req.body;
    await model.TrainDetails.create({
      TrainName: TrainName,
      TrainCode: TrainCode,
      DepartureStation: DepartureStation,
      DestinationStation: DestinationStation,
      TypeOfTrain: TypeOfTrain,
      TypeOfCoachs: TypeOfCoach.join("|"),
      RunningSchedule: RunningSchedule,
      RunningDay: RunningDay.join("|"),
    });
    for (const curr of stops) {
      await model.TrainJourney.create({
        TrainCode: TrainCode,
        PlaceName: curr.placeName,
        Time: curr.time,
        Distance: curr.distance,
        TrainStoppageTime: curr.TrainStoppageTime,
        General: curr.price["General Coach (Second Class)"]
          ? curr.price["General Coach (Second Class)"]
          : null,
        Sleeper: curr.price["Sleeper"] ? curr.price["Sleeper"] : null,
        AC3Tier: curr.price["AC3Tier"] ? curr.price["AC3Tier"] : null,
        AC2Tier: curr.price["AC2Tier"] ? curr.price["AC2Tier"] : null,
        FirstClassAC: curr.price["FirstClassAC"]
          ? curr.price["FirstClassAC"]
          : null,
        ACChairCar: curr.price["AC Chair Car (CC)"]
          ? curr.price["AC Chair Car (CC)"]
          : null,
        ExecutiveChairCar: curr.price["Executive Chair Car (EC)"]
          ? curr.price["Executive Chair Car (EC)"]
          : null,
        SecondSitting: curr.price["SecondSitting"]
          ? curr.price["SecondSitting"]
          : null,
        GaribRath: curr.price["GaribRath"] ? curr.price["GaribRath"] : null,
        Vistadome: curr.price["Vistadome"] ? curr.price["Vistadome"] : null,
        LHB: curr.price["LHB"] ? curr.price["LHB"] : null,
        HighCapacityParcelVan: curr.price["HighCapacityParcelVan"]
          ? curr.price["HighCapacityParcelVan"]
          : null,
        PantryCar: curr.price["PantryCar"] ? curr.price["PantryCar"] : null,
        DeenDayalu: curr.price["DeenDayalu"] ? curr.price["DeenDayalu"] : null,
      });
    }
    for (const curr of coaches) {
      await model.TrainCoach.create({
        TrainCode: TrainCode,
        CoachName: curr.coachType,
        PerCabinSheats: curr.perCabinSeat,
        TotalCabin: curr.totalCabin,
      });
    }
    return res.send({ success: true });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const getTrains = async (req: Request, res: Response) => {
  try {
    let {
      DepartureStation,
      DestinationStation,
      JourneyDate,
      DepartureTime,
      DestinationTime,
    } = req.body;
    let JourneyTime = JourneyDate;
    if (typeof JourneyDate === "string"){
      JourneyDate = new Date(JourneyDate).getDay();
      JourneyTime = new Date(JourneyTime);
    }
    const trainData1 = await model.TrainJourney.findAll({
      where: {
        PlaceName: DepartureStation,
      },
      attributes: ["TrainCode", "Time"],
    })
    const trainData2 = await model.TrainJourney.findAll({
      where: {
        PlaceName: DestinationStation,
      },
      attributes: ["TrainCode", "Time"],
    })
    const commonTrains: Array<{ TrainCode: string, DepartureTime: string, DestinationTime: string }> = trainData2.map((ele1: any) => {
      const item = ele1.dataValues;
      console.log("Item ", item);
      const match = trainData1.find((ele: any) => {
        return ele.dataValues.TrainCode === item.TrainCode
      });
      if (match) {
        return {
          TrainCode: item.TrainCode,
          DepartureTime: match.Time,
          DestinationTime: item.Time
        }
      }
    })
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const JourneyDay = weekdays[JourneyDate];
    const trainDetails: any = [];
    if (DepartureTime === null || DestinationTime === null) {
      for (const trainItem of commonTrains) {
        const trainData = await model.TrainDetails.findAll({
          where: {
            RunningDay: {
              [Op.like]: `%${JourneyDay}%`,
            },
            TrainCode: trainItem.TrainCode,
          },
        });
        console.log("Train Data ", trainData);
        const response = await getTotalJourneyTime({trainCode : trainItem.TrainCode , departureStation : DepartureStation , destinationStation : DestinationStation , JourneyDate : JourneyTime});
        trainDetails.push({ ...trainData[0].dataValues, "DepartureTime": trainItem.DepartureTime, "DestinationTime": trainItem.DestinationTime , ...response });
      }
      return res.send({ success: true, data: trainDetails });
    }
    const filteredTrainsAccordingToTime = commonTrains.filter(item => {
      const departureTrainHr = Number(item.DepartureTime.split(":")[0]);
      const departureTrainMin = Number(item.DepartureTime.split(":")[1]);
      const destinationTrainHr = Number(item.DestinationTime.split(":")[0]);
      const destinationTrainMin = Number(item.DestinationTime.split(":")[1]);
      const departureTimeHr = Number(DepartureTime.split(":")[0]);
      const departureTimeMin = Number(DepartureTime.split(":")[1]);
      const destinationTimeHr = Number(DestinationTime.split(":")[0]);
      const destinationTimeMin = Number(DestinationTime.split(":")[1]);

      if (((departureTimeHr < departureTrainHr) || (departureTimeHr == departureTrainHr && departureTimeMin <= departureTrainMin)) && ((destinationTimeHr > destinationTrainHr) || (destinationTimeHr === destinationTrainHr && destinationTimeMin >= destinationTrainMin)))
        return true;
      return false;
    })
    for (const trainItem of filteredTrainsAccordingToTime) {
      const trainData = await model.TrainDetails.findAll({
        where: {
          RunningDay: {
            [Op.like]: `%${JourneyDay}%`,
          },
          TrainCode: trainItem.TrainCode,
        },
      });
      console.log("Train Data ", trainData);
      if (trainData.length === 0) continue;
      const response = await getTotalJourneyTime({trainCode : trainItem.TrainCode , departureStation : DepartureStation , destinationStation : DestinationStation , JourneyDate : JourneyTime});
      trainDetails.push({ ...trainData[0].dataValues, "DepartureTime": trainItem.DepartureTime, "DestinationTime": trainItem.DestinationTime ,  ...response });
    }
    return res.send({ success: true, data: trainDetails });
  } catch (error) {
    console.log("Error  ", error);
    return { success: false, msg: "Some thing Went Wrong!!!" };
  }
};
export const getTrainFilterOption = async (req: Request, res: Response) => {
  try {
    const typeOfTrainData = await model.TypeOfTrain.findAll({
      attributes: ["TrainType"],
    });

    return res.send({
      success: true,
      data: {
        TypeOfTrainData: typeOfTrainData
      },
    });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const getAvailabilityOfSeats = async (
  trainCode: string,
  journeyDate: Date,
  DepartureStation: string,
  DestinationStation: string
) => {
  try {
    console.log(
      "Train  Code  ",
      trainCode,
      DepartureStation,
      DestinationStation
    );
    const response1 = await model.Availability.findAll({
      where: {
        TrainCode: trainCode,
        // JourneyDate: journeyDate,
        PlaceName: DepartureStation,
      },
    });
    // console.log("Response1 ",response1);
    const response2 = await model.Availability.findAll({
      where: {
        TrainCode: trainCode,
        // JourneyDate: journeyDate,
        PlaceName: DestinationStation,
      },
    });
    console.log("Response 1 ", response1[0].dataValues);
    let response: Array<Record<string, []>> = [];
    for (let i = 0; i < response1.length; i++) {
      let obj = {};
      for (const currKey in response1[i].dataValues) {
        obj = {
          ...obj,
          [currKey]:
            currKey === "Seats"
              ? Number(response1[i].dataValues[currKey]) >
                Number(response2[i].dataValues[currKey])
                ? response2[i].dataValues[currKey]
                : response1[i].dataValues[currKey]
              : response1[i].dataValues[currKey],
        };
      }
      response.push(obj);
    }
    return response;
  } catch (error) {
    return [];
  }
};
export const getPriceOfTrainSeats = async (req: Request, res: Response) => {
  try {
    const {
      DepartureStation,
      DestinationStation,
      Adults,
      Kids,
      seniorCitizen,
      trainCode,
      coachType,
    } = req.body;
    console.log(DepartureStation);
    const departureTrainDistance = Number(
      (
        await model.TrainJourney.findAll({
          where: {
            PlaceName: DepartureStation,
            TrainCode: trainCode,
          },
        })
      )[0].dataValues.Distance
    );
    const destinationTrainDistance = Number(
      (
        await model.TrainJourney.findAll({
          where: {
            PlaceName: DestinationStation,
            TrainCode: trainCode,
          },
        })
      )[0].dataValues.Distance
    );
    const seatPerKmPrice = Number(
      (
        await model.TrainCoach.findAll({
          where: {
            TrainCode: trainCode,
            CoachName: coachType,
          },
        })
      )[0].dataValues.PerKmPrice
    );
    console.log(
      "Departure Train Distance ",
      departureTrainDistance,
      " Destination Train Distance ",
      destinationTrainDistance,
      " Seat Per Km Price ",
      seatPerKmPrice
    );
    const price =
      (destinationTrainDistance - departureTrainDistance) * seatPerKmPrice;
    let answer = 0;
    answer = answer + Adults * price;
    answer = answer + Kids * (price - (price * 10) / 100);
    answer = answer + seniorCitizen * (price - (price * 20) / 100);
    return res.send({ success: true, data: answer.toFixed(2) });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const checkingTrainCodeExistOrNot = async (
  req: Request,
  res: Response
) => {
  try {
    const { trainCode } = req.body;
    const isExist = await model.TrainDetails.findAll({
      where: {
        TrainCode: trainCode,
      },
    });
    if (isExist && isExist.length > 0) {
      return res.send({ success: false, data: false });
    } else {
      return res.send({ success: true, data: true });
    }
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
const getTotalJourneyTime = async (obj : any) => {
  try {
    const { trainCode, departureStation, destinationStation, JourneyDate } = obj;
    const data = await model.TrainJourney.findAll({ where: { TrainCode: trainCode } });

    let index = 0;
    for (const item of data) {
      if (item.dataValues.PlaceName === departureStation) break;
      index++;
    }

    let totalTime = 0;
    let prevHr = Number(data[index].dataValues.Time.split(":")[0]);
    let prevMin = Number(data[index].dataValues.Time.split(":")[1]);
    let endDate = new Date(JourneyDate);

    for (let i = index; i < data.length; i++) {
      let currHr = Number(data[i].dataValues.Time.split(":")[0]);
      let currMin = Number(data[i].dataValues.Time.split(":")[1]);

      // Handle midnight transition
      if (currHr < prevHr) {
        currHr += 24; // Adjust for next day transition
        endDate.setDate(endDate.getDate() + 1); // Increment the day
      }

      const timeTakeToReachAnotherStation = (currHr - prevHr) * 60 + (currMin - prevMin);
      totalTime += timeTakeToReachAnotherStation;
      prevHr = currHr % 24;  // Reset hour for next calculation
      prevMin = currMin;

      if (data[i].dataValues.PlaceName === destinationStation) break;
    }

    const totalHr = Math.floor(totalTime / 60);
    const totalMin = totalTime % 60;
    let startDate = new Date(JourneyDate);

    return { StartDate: startDate, TotalJourneyTime: `${totalHr} hr ${totalMin} min`, EndDate: endDate };

  } catch (error) {
    console.log("Error", error);
    return { JourneyDate: new Date(), TotalJourneyTime: "0 hr 0 min", EndDate: new Date() };
  }
};
export const getParticularTrainCoachDetails = async (req: Request, res: Response) => {
  try {
    const { trainCode } = req.body;
    const data = await model.TrainDetails.findAll({
      where: {
        TrainCode: trainCode,
      },
    });
    return res.send({ success: true, data: data[0].dataValues.TypeOfCoachs.split("|") });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const getPriceOfTrainSeat = async ( req : Request , res : Response) => {
  try{
    const { trainCode , departureStation , destinationStation  } = req.body;

    const distanceOfDepartureStation = ( await model.TrainJourney.findAll({
      where : {
        TrainCode : trainCode,
        PlaceName : departureStation
      }
    }))[0].dataValues.Distance;
    const distanceOfDestinationStation = ( await model.TrainJourney.findAll({
      where : {
        TrainCode : trainCode,
        PlaceName : destinationStation
      }
    }))[0].dataValues.Distance;
    console.log("Distance of Departure Station ", distanceOfDepartureStation, " Distance of Destination Station ", distanceOfDestinationStation);
    const prices = await model.TrainCoach.findAll({
      where : {
        TrainCode : trainCode
      }
    });
    let opt : Record<string, number> = {};
    for(const data of prices) {
      console.log("Data ", data.dataValues);
      const  item  = data.dataValues;
      const perKmPrice = Number(item.PerKmPrice);
      const totalPrice = (distanceOfDestinationStation - distanceOfDepartureStation) * perKmPrice;
      opt[item.CoachName] = totalPrice;
    }
    return res.send({ success: true, data: opt });
  } catch(error){
    console.log("Error  ", error);
    return res.send({ success: false });
  }
}