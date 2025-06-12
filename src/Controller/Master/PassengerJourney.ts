import { Request, Response } from "express";
import model from "../../Model/model";
import { Op, Sequelize, where } from "sequelize";

export const cardsData = async (req: Request, res: Response) => {
    try {
        const { userEmail } = req.body;
        // total Upcoming Journey.
        const totalUpcomingJourney = await model.Ticket.count({
            distinct: true,
            col: 'JourneyDate',
            userEmail : userEmail
        })

        // monthly Upcoming Journey.
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const monthlyCount = await model.Ticket.count({
            distinct: true,
            col: 'journeyDate',
            where: {
                journeyDate: {
                    [Op.between]: [startDate, endDate]
                },
                userEmail : userEmail
            }
        });

        // yearly Upcoming Journey.
        const y_startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        const y_endDate = new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate());

        const yearlyCount = await model.Ticket.count({
            distinct: true,
            col: 'journeyDate',
            where: {
                journeyDate: {
                    [Op.between]: [y_startDate, y_endDate]
                },
                userEmail : userEmail
            }
        });

        // most train  Journey.
        const today = new Date();

        const trainCounts = await model.Ticket.findAll({
            attributes: ['TrainName', 'TrainCode', [Sequelize.fn('COUNT', Sequelize.col('TrainCode')), 'travelCount']],
            where: {
                journeyDate: {
                    [Op.gt]: today // Filters for upcoming journeys
                },
                userEmail
            },
            group: ['TrainName', 'TrainCode'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('TrainCode')), 'DESC']], // Sorts by most traveled train
            limit: 1 // Gets the most traveled train
        });
        let TrainName = "";
        if (trainCounts.length > 0) {
            TrainName = trainCounts[0].TrainName;
        }

        // Upcoming Journey Details 
        const trainJourneyDetails = await model.Ticket.findAll({
            order: [["ID", "DESC"]]
        });

        const { JourneyDate: upcomingJourneyDate } = trainJourneyDetails[0].dataValues;

        const upcomingJourneyDetails = await model.Ticket.findAll({
            where: {
                JourneyDate: upcomingJourneyDate
            },
            userEmail : userEmail
        })


        return res.send({
            success: true, data: {
                totalUpcomingJourney,
                monthlyCount,
                yearlyCount,
                MostTravelTrain: TrainName,
                upcomingJourneyDetails
            }
        });
    } catch (error) {
        console.log("Error  ", error);
        return res.send({ success: false });
    }
}

export const dayByDayJourneyDetails = async (req: Request, res: Response) => {
    try {
        const { userEmail } = req.body;
        const y_startDate = new Date();
        const y_endDate = new Date(y_startDate.getFullYear() + 1, y_startDate.getMonth(), y_startDate.getDate());

        const data = await model.Ticket.findAll({
            attributes: [
                'journeyDate',
                [Sequelize.fn('MIN', Sequelize.col('TrainCode')), 'TrainCode'],
                [Sequelize.fn('MIN', Sequelize.col('TrainName')), 'TrainName'],
                [Sequelize.fn('MIN', Sequelize.col('DestinationStation')), 'DestinationStation'],
                [Sequelize.fn('MIN', Sequelize.col('DepartureStation')), 'DepartureStation'],
                [Sequelize.fn('MIN', Sequelize.col('DepartureTime')), 'DepartureTime'],
                [Sequelize.fn('MIN', Sequelize.col('DestinationTime')), 'DestinationTime']
            ],
            group: ['journeyDate'],
            where: {
                journeyDate: {
                    [Op.between]: [y_startDate, y_endDate]
                },
                userEmail : userEmail
            }
        });


        console.log(data);

        return res.send({ success: true, data });
    } catch (error) {
        console.log("Error  ", error);
        return res.send({ success: false });
    }
}

export const trainJourneyDetails = async (req: Request, res: Response) => {
    try {
        const { userEmail } = req.body;
        const { trainCode, DepartureStation, DestinationStation } = req.body;
        const trainJourney = await model.TrainJourney.findAll({
            where: {
                TrainCode: trainCode
            },
            userEmail
        });
        const data = [];
        let isFlag = false;
        for (const item of trainJourney) {
            const val = item.dataValues;
            if (val.PlaceName === DepartureStation) {
                isFlag = true;
            }

            if (isFlag) {
                data.push(val);
            }

            if (val.PlaceName === DestinationStation) {
                isFlag = false;
            }
        }
        return res.send({ success: true, data });
    } catch (error) {
        console.log("Error  ", error);
        return res.send({ success: false });
    }
}

export const trainTicketsDetails = async (req: Request, res: Response) => {
    try {
        const { trainCode, JourneyDate , userEmail } = req.body;
        const ticket = await model.Ticket.findAll({
            where: {
                TrainCode: trainCode,
                JourneyDate: JourneyDate,
                userEmail
            }
        });

        return res.send({ success: true, data: ticket });
    } catch (error) {
        console.log("Error  ", error);
        return res.send({ success: false });
    }
}