import { Request, Response } from "express";
import model from "../../Model/model";
import { Op, Sequelize } from "sequelize";

const optField = [
  "StationName",
  "PlaceName",
  "PlaceType",
  "IsHillStation",
  "RailwayZone",
];
export const getRailwayStation = async (req: Request, res: Response) => {
  try {
    const { pageNo, limitNo } = req.body;
    const data = await model.RailwayStationTable.findAll({
      offset: pageNo * limitNo,
      limit: limitNo,
    });
    return res.send({ success: true, data });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false, error: "Something Went Wrong" });
  }
};
export const getRailwayStationWithFilter = async (
  req: Request,
  res: Response
) => {
  try {
    const { pageNo, limitNo, isSearch } = req.body;
    let obj = {};
    for (const val of optField) {
      if (req.body[val]) {
        obj = {
          ...obj,
          [val]: isSearch ? { [Op.like]: `%${req.body[val]}%` } : req.body[val],
        };
      }
    }
    let data;
    if (!isSearch) {
      data = await model.RailwayStationTable.findAll({
        where: obj,
        offset: pageNo * limitNo,
        limit: limitNo,
      });
    } else {
      data = await model.RailwayStationTable.findAll({
        where: { [Op.or]: obj },
        offset: pageNo * limitNo,
        limit: limitNo,
      });
    }
    return res.send({ success: true, data });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false, error: "Something Went Wrong" });
  }
};
export const getRailwayStationOptions = async (req: Request, res: Response) => {
  try {
    let obj = {};
    for (const val of optField) {
      const value = await model.RailwayStationTable.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(`${val}`)), val]],
      });
      obj = { ...obj, [val]: value.map((ele: any) => ele[val]) };
    }
    return res.send({ success: true, data: obj });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};
export const getRailwayStationCardValues = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await model.RailwayStationTable.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("ID")), "TotalRailwayStations"],
        [
          Sequelize.literal('COUNT(CASE WHEN "IsHillStation" = true THEN 1 END)'),
          "TotalHillStations"
        ],
        [
          Sequelize.literal('COUNT(CASE WHEN "PlaceType" = \'City\' THEN 1 END)'),
          "TotalStationInCity"
        ],
        [
          Sequelize.literal('COUNT(CASE WHEN "PlaceType" = \'Village\' THEN 1 END)'),
          "TotalStationInVillage"
        ]
      ]
    });
    return res.send({ success: true, data });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
};