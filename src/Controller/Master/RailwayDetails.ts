import { Request, Response } from "express";
import model from "../../Model/model";
import { Op } from "sequelize";

export const getState = async (req: Request, res: Response) => {
  try {
    const data = await model.State.findAll({});
    return res.send({ success: true, data: data });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
}

export const getStations = async (req: Request, res: Response) => {
  try {
    const { StateName, TypeOfStation, IsActive, NoOfPlatform, Capacity } = req.body;
    let filter = {};
    if (TypeOfStation) {
      filter = { TypeOfStation: TypeOfStation }
    };
    if (IsActive != null) {
      filter = { ...filter, IsActive: IsActive }
    }
    if (NoOfPlatform) {
      filter = {
        ...filter,
        NumberOfPlatforms: {
          [Op.and]: {
            [Op.gte]: NoOfPlatform?.min,
            [Op.lte]: NoOfPlatform?.max
          }
        }
      }
    }
    if (Capacity) {
      filter = {
        ...filter, Capacity: {
          [Op.and]: {
            [Op.gte]: Capacity?.min,
            [Op.lte]: Capacity?.max
          }
        }
      }
    }
    const data = await model.Places.findAll({
      where: {
        State: StateName,
        ...filter
      }
    });
    return res.send({ success: true, data });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
}

export const addStation = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    await model.Places.create(data);
    return res.send({ success: true });
  }
  catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
}

export const editStation = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    await model.Places.update(data, { where: { ID: data.ID } });
    return res.send({ success: true });
  }
  catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
}

export const getStationCardValues = async (req: Request, res: Response) => {
  try {
    const { StateName } = req.body;
    const terminalStation = await model.Places.count({ where: { TypeOfStation: "Terminal", State: StateName } });
    const junctionStation = await model.Places.count({ where: { TypeOfStation: "Junction", State: StateName } });
    const centralStation = await model.Places.count({ where: { TypeOfStation: "Central", State: StateName } });
    const normalStation = await model.Places.count({ where: { TypeOfStation: "Normal", State: StateName } });
    const isActiveStation = await model.Places.count({ where: { IsActive: true, State: StateName } });
    const totalStation = await model.Places.count({ where: { State: StateName } });
    return res.send({
      success: true, data: {
        Terminal: terminalStation,
        Junction: junctionStation,
        Central: centralStation,
        Normal: normalStation,
        IsActive: isActiveStation,
        Total: totalStation
      }
    })
  } catch (error) {
    console.log("Error ", error);
    return res.send({ success: false });
  }
}

export const searchStation = async (req: Request, res: Response) => {
  try {
    const searchFields: Array<string> = ["City", "NumberOfPlatforms", "TypeOfStation", "Capacity"];
    const { searchValue, State } = req.body;
    let searchQuery = {};
    searchFields.forEach((item) => {
      searchQuery = { ...searchQuery, [item]: { [Op.like] : `%${searchValue}%` } };
    })
    const data = await model.Places.findAll({
      where: {
        [Op.and]: {
          State: State,
          [Op.or]: {
            ...searchQuery
          }
        }
      }
    })
    return res.send({ success: true, data });
  } catch (error) {
    console.log("Error ", error);
    res.send({ success: false });
  }
}