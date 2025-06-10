import { Request, Response } from "express";
import model from "../../Model/model";
import { ITrainDetails } from "../../Interface/CommonInterface";
import { Op } from "sequelize";
const stripe = require("stripe")();
import amqplib from "amqplib";

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
    if (typeof JourneyDate === "string") {
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
        const response = await getTotalJourneyTime({ trainCode: trainItem.TrainCode, departureStation: DepartureStation, destinationStation: DestinationStation, JourneyDate: JourneyTime });
        trainDetails.push({ ...trainData[0].dataValues, "DepartureTime": trainItem.DepartureTime, "DestinationTime": trainItem.DestinationTime, ...response });
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
      const response = await getTotalJourneyTime({ trainCode: trainItem.TrainCode, departureStation: DepartureStation, destinationStation: DestinationStation, JourneyDate: JourneyTime });
      trainDetails.push({ ...trainData[0].dataValues, "DepartureTime": trainItem.DepartureTime, "DestinationTime": trainItem.DestinationTime, ...response });
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
    const coachesDetails = await model.TrainCoach.findAll({
      where: {
        TrainCode: trainCode
      }
    });
    console.log("Coaches Details", coachesDetails);
    const data: Array<Record<string, number>> = [];
    for (const item of coachesDetails) {
      const { CoachName, TotalCabin, PerCabinSheats } = item.dataValues;
      let totalSeats = TotalCabin * PerCabinSheats;
      const bookedSeats = await model.Ticket.findAll({
        where: {
          TrainCode: trainCode,
          CoachType: CoachName,
          JourneyDate: journeyDate
        }
      });
      totalSeats = totalSeats - bookedSeats.length;
      data.push({ CoachName, TotalAvalibleSeats: totalSeats });
    }
    console.log("Data ", data);
    return data;
  } catch (error) {
    return [];
  }
};
export const getPriceOfTrainSeats = async (req: Request, res: Response) => {
  try {
    const {
      DepartureStation,
      DestinationStation,
      trainCode,
      coachType,
    } = req.body;
    console.log(DepartureStation);
    const trainCoachDetails = await model.TrainCoach.findAll({
      where: {
        TrainCode: trainCode,
        CoachName: coachType
      }
    });

    const departureStationDetails = await model.TrainJourney.findAll({
      where: {
        PlaceName: DepartureStation,
        TrainCode: trainCode
      }
    });

    const destinationStationDetails = await model.TrainJourney.findAll({
      where: {
        PlaceName: DestinationStation,
        TrainCode: trainCode
      }
    });
    console.log(trainCoachDetails[0].dataValues["PerKmPrice"], " ", destinationStationDetails[0].dataValues["Distance"], " ", departureStationDetails[0].dataValues["Distance"]);
    const data = trainCoachDetails[0].dataValues["PerKmPrice"] * (destinationStationDetails[0].dataValues["Distance"] - departureStationDetails[0].dataValues["Distance"]);
    return res.send({ success: true, data: data });
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
const getTotalJourneyTime = async (obj: any) => {
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
export const getPriceOfTrainSeat = async (req: Request, res: Response) => {
  try {
    const { trainCode, departureStation, destinationStation } = req.body;

    const distanceOfDepartureStation = (await model.TrainJourney.findAll({
      where: {
        TrainCode: trainCode,
        PlaceName: departureStation
      }
    }))[0].dataValues.Distance;
    const distanceOfDestinationStation = (await model.TrainJourney.findAll({
      where: {
        TrainCode: trainCode,
        PlaceName: destinationStation
      }
    }))[0].dataValues.Distance;
    console.log("Distance of Departure Station ", distanceOfDepartureStation, " Distance of Destination Station ", distanceOfDestinationStation);
    const prices = await model.TrainCoach.findAll({
      where: {
        TrainCode: trainCode
      }
    });
    let opt: Record<string, number> = {};
    for (const data of prices) {
      console.log("Data ", data.dataValues);
      const item = data.dataValues;
      const perKmPrice = Number(item.PerKmPrice);
      const totalPrice = (distanceOfDestinationStation - distanceOfDepartureStation) * perKmPrice;
      opt[item.CoachName] = totalPrice;
    }
    return res.send({ success: true, data: opt });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const makePayment = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    let price: number = 0;
    for (const item of req.body) {
      price += item.price;
    }
    console.log("Price ", price);
    const data = [{
      price_data: {
        currency: "usd",
        product_data: {
          name: "Train Ticket"
        },
        unit_amount: Number(price).toFixed(0)
      },
      quantity: 1
    }];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: data,
      mode: "payment",
      success_url: "http://localhost:3000/#/success",
      cancel_url: "http://localhost:3000/"
    });
    console.log("Session ", session);
    return res.send({ success: true, data: session });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const bookingTicket = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    console.log("data ", data);
    const passengerDepartureDistance = (await model.TrainJourney.findAll({
      where: {
        TrainCode: data[0].trainCode,
        PlaceName: data[0].departureStation
      }
    }))[0].dataValues.Distance;
    const passengerDestinationDistance = (await model.TrainJourney.findAll({
      where: {
        TrainCode: data[0].trainCode,
        PlaceName: data[0].destinationStation
      }
    }))[0].dataValues.Distance;
    console.log("Passenger Departure Distance   ", passengerDepartureDistance, "  Passenger Destination Station ", passengerDestinationDistance);

    const passengerDetailsAccordingCoachType: Map<string, any> = new Map();

    // Data set according to coach type.
    data.forEach((item: any) => {
      console.log("passengerCoachType ", item.passengerCoachType);
      if (!passengerDetailsAccordingCoachType.has(item.passengerCoachType as string)) {
        passengerDetailsAccordingCoachType.set(item.passengerCoachType as string, []);
      }
      passengerDetailsAccordingCoachType.get(item.passengerCoachType as string)?.push(item);
    });

    // Coach Type Details.
    const coachTypeDetails = await model.TrainCoach.findAll({
      where: {
        TrainCode: data[0].trainCode
      }
    });
    console.log("Coach Type Details ", coachTypeDetails);

    const coachSeatDetails: Map<string, Array<Array<boolean>>> = new Map();
    for (const coachDetails of coachTypeDetails) {
      let { CoachName, TotalCabin, PerCabinSheats } = coachDetails.dataValues;
      console.log("CoachName  ", CoachName, "   Total Cabin ", TotalCabin, "    Per Cabin Seat  ", PerCabinSheats);

      if (!coachSeatDetails.has(CoachName)) {
        coachSeatDetails.set(CoachName, []);
      }
      const alreadySeatBook = await model.Ticket.findAll({
        where: {
          TrainCode: data[0].trainCode,
          JourneyDate: data[0].journeyStartDate,
          CoachType: CoachName,
          [Op.and]: {
            DestinationDistance: {
              [Op.gt]: passengerDepartureDistance
            },
            DepartureDistance: {
              [Op.lt]: passengerDestinationDistance
            }
          }
        }
      });
      console.log("Already Seat Book  ", alreadySeatBook);

      while (TotalCabin > 0) {
        const seatArray: Array<boolean> = [];
        for (let i = 0; i < PerCabinSheats; i++) {
          seatArray.push(false);
        }
        coachSeatDetails.get(CoachName)?.push(seatArray);
        TotalCabin--;
      }
      // Details of seat which already books
      for (const seatDetails of alreadySeatBook) {
        const { CoachNumber, SeatNumber } = seatDetails.dataValues;
        console.log("Coach Number ", CoachNumber, " Seat Number ", SeatNumber);

        if (coachSeatDetails.get(CoachName)) {
          coachSeatDetails.get(CoachName)![CoachNumber][SeatNumber] = true;
        }
      }
    }

    console.log("SEATS  ");
    // Seat Booking
    for (const [key, value] of passengerDetailsAccordingCoachType) {
      let noOfPassengers = passengerDetailsAccordingCoachType.get(key).length;
      console.log("No Of Passengers   ", noOfPassengers, " Key ", key, " value ", value);

      while (noOfPassengers > 0) {
        let valueIndex = 0;
        let maxNoSeatsAvaliable = 0;
        let startNumber = 0;
        let endNumber = 0;
        let coachNumber = 0;
        let noSeatsAvaliableContinuesly = 0;
        let tempCoachNumber = 0;
        for (const coachs of coachSeatDetails.get(key) as []) {
          let start = 0, index = 0;
          tempCoachNumber += 1;
          for (const coach of coachs as []) {
            index += 1;
            if (!coach) {
              if (noSeatsAvaliableContinuesly === 0) start = index;
              noSeatsAvaliableContinuesly++;
            } else {
              noSeatsAvaliableContinuesly = 0;
            }

            if (maxNoSeatsAvaliable < noSeatsAvaliableContinuesly) {
              startNumber = start;
              coachNumber = tempCoachNumber;
              endNumber = index;
            }
          }
        }
        while (startNumber <= endNumber && noOfPassengers > 0) {
          console.log("Insert Value ", value[valueIndex])
          await model.Ticket.create({
            TrainCode: value[valueIndex].trainCode,
            TrainName: value[valueIndex].trainName,
            JourneyDate: value[valueIndex].journeyStartDate,
            CoachType: key,
            CoachNumber: coachNumber,
            SeatNumber: startNumber,
            PassengerName: value[valueIndex].passengerName,
            PassengerAge: value[valueIndex].passengerAge,
            PassengerPhoneNumber: value[valueIndex].passengerPhone,
            PassengerCategory: value[valueIndex].passengerCategory,
            PassengerGender: value[valueIndex].passengerGender,
            Price: value[valueIndex].price,
            DepartureStation: value[valueIndex].departureStation,
            DestinationStation: value[valueIndex].destinationStation,
            DepartureTime: value[valueIndex].departureTime,
            DestinationTime: value[valueIndex].destinationTime,
            isBooked: false
          })
          valueIndex += 1;
          console.log("Insert Operation Done!!  Coach Number  ", coachNumber, "  StartNumber ", startNumber);
          if (coachSeatDetails.has(key)) {
            if (coachSeatDetails.get(key)) {
              console.log("Coach Number Size  ", coachSeatDetails.get(key));
              coachSeatDetails.get(key)![coachNumber - 1][startNumber] = true;
            }
          }
          startNumber++;
          noOfPassengers--;
        }

      }
    }
    return res.send({ success: true, data: "Under Construction" });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const tatkalBooking = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const exchangeName = "train_ticket_exchange";
    const routingKey = "train_seat_booking";

    await channel.assertExchange(exchangeName, "direct", { durable: false });
    await channel.assertQueue("seat_booking", { durable: false });

    await channel.bindQueue("seat_booking", exchangeName, routingKey);

    channel.publish(exchangeName , routingKey, Buffer.from(JSON.stringify(data)));

    console.log("Message Enter To Message Queue");
    connection.close();
    return res.send({success : true});
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
}