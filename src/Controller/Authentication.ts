import jwt from "jsonwebtoken";
const secretKey = "Ayush_22";
import model from "../Model/model";
import { Request, Response } from "express";

export const signInFunc = async (req: Request, res: Response) => {
  try {
    const { UserName, UserPassword } = req.body;
    const userData = await model.userMasterTable.findAll({
      where: {
        UserName: UserName,
        userPassword: UserPassword,
      },
    });
    if (!userData || userData.length === 0) {
      return res.send({
        success: false,
        userData: [],
        error: "User Not Found!",
      });
    }
    const token = jwt.sign(
      { ID: userData[0].ID, userEmail: userData[0].UserEmail },
      secretKey
    );
    res.cookie("token", token);
    return res.send({ success: true, data: userData[0] });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false, error: "Something Went Wrong!" });
  }
};

export const signUpFunc = async (req: Request, res: Response) => {
  try {
    const { UserEmail, UserPassword, UserName } = req.body;
    await model.userMasterTable.create({
      UserEmail,
      UserName,
      IsAdmin: false,
      UserPassword
    });
    return res.send({success : true , message : "User Created Successfully!"});
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false, error: "Something Went Wrong!" });
  }
};
