import { Request, Response } from "express";
import model from "../../Model/model";

export const getState = async ( req : Request , res : Response ) => {
  try {
    const data = await model.State.findAll({});
    return res.send({success : true , data : data});
  } catch(error){
    console.log("Error  ",error);
    return res.send({success : false});
  }
}

export const getStations = async ( req : Request , res : Response ) => {
  try {
    const { StateName } = req.body;
    const data = await model.Places.findAll({ State : StateName});
    return res.send({success : true , data});
  } catch(error){
    console.log("Error  ",error);
    return res.send({success : false});
  }
}

export const addStation = async ( req : Request , res : Response ) => {
  try {
    const {data} = req.body;
    await model.Places.create(data);
    return res.send({success : true});
  }
  catch(error){
    console.log("Error  ",error);
    return res.send({success : false});
  }
}

export const editStation = async ( req : Request , res : Response ) => {
  try {
    const {data} = req.body;
    await model.Places.update(data, { where : { ID : data.ID}});
    return res.send({success : true});
  }
  catch(error){
    console.log("Error  ",error);
    return res.send({success : false});
  }
}