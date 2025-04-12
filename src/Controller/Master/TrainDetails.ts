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
const timeChecking = (time1: string, time2: string) => {
  const arr1 = time1.split(":");
  const arr2 = time2.split(":");
  console.log("Time 1", time1, "  Time 2 ", time2);
  if (Number(arr1[0]) < Number(arr2[0])) {
    return true;
  } else if (Number(arr1[0]) === Number(arr2[0])) {
    if (Number(arr1[1]) <= Number(arr2[1])) {
      console.log("True");
      return true;
    }
  }
  return false;
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
    if (typeof JourneyDate === "string")
      JourneyDate = new Date(JourneyDate).getDay();
    const departureTrain = await model.TrainJourney.findAll({
      where: {
        PlaceName: DepartureStation,
      },
      attributes: ["TrainCode", "Time"],
    });
    const departureTrainCodeArr = departureTrain
      .filter((ele: any) => {
        return timeChecking(ele.Time, DepartureTime);
      })
      .map((ele: any) => ele.TrainCode);
    console.log(departureTrainCodeArr);
    const distinationStationArr = await model.TrainJourney.findAll({
      where: {
        [Op.and]: {
          TrainCode: {
            [Op.in]: departureTrainCodeArr,
          },
          PlaceName: DestinationStation,
        },
      },
      attributes: ["TrainCode", "Time"],
    });
    // console.log(departureTrainCodeArr);
    const destinationTrainCodeArr = distinationStationArr
      .filter((ele: any) => {
        return timeChecking(ele.Time, DestinationTime);
      })
      .map((ele: any) => ele.TrainCode);
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
    const trainData = [];
    for (const currTrainCode of destinationTrainCodeArr) {
      const trainDetails = await model.TrainDetails.findAll({
        where: {
          RunningDay: {
            [Op.like]: `%${JourneyDay}%`,
          },
          TrainCode: currTrainCode,
        },
      });
      if (trainDetails.length > 0) {
        const leavingTime = departureTrain
          .filter((ele: any) => {
            return ele.TrainCode === currTrainCode;
          })
          .map((ele: any) => ele.Time)[0];
        const destinationTime = distinationStationArr
          .filter((ele: any) => {
            return ele.TrainCode === currTrainCode;
          })
          .map((ele: any) => ele.Time)[0];
        const details = trainDetails[0];
        trainData.push({ ...details.dataValues, leavingTime, destinationTime });
      }
    }
    return res.send({ success: true, data: trainData });
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
    const trainFacilites = await model.TrainFacilites.findAll({
      attributes: ["FacilitesName"],
    });

    return res.send({
      success: true,
      data: {
        TypeOfTrainData: typeOfTrainData,
        TrainFacilites: trainFacilites,
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
