import jwt from "jsonwebtoken";
import model from "../Model/model";
import { Request, Response } from "express";

export const signInFunc = async (req: Request, res: Response) => {
  try {
    const { UserEmail, UserPassword } = req.body;
    const userData = await model.userMasterTable.findAll({
      where: {
        UserEmail: UserEmail,
        UserPassword: UserPassword,
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
      process.env.secretKey || ""
    );
    console.log("Token  ", token);
    // res.cookie("trainCookie", token, { httpOnly: true });
    res.cookie("trainCookie", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict"
    });
    

    console.log("Cookies", req.cookies);
    return res.send({ success: true, data: userData[0] });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false, error: "Something Went Wrong!" });
  }
};

export const signUpFunc = async (req: Request, res: Response) => {
  try {
    const { UserEmail, UserPassword } = req.body;
    // checking user Already exist or not.
    const data = await model.userMasterTable.findAll({
      where: {
        UserEmail: UserEmail
      }
    });
    if (data.length > 0) {
      return res.send({ success: false, error: "This email ID is already in use. Please try a different one or log in." })
    }
    await model.userMasterTable.create({
      UserEmail,
      IsAdmin: false,
      UserPassword
    });
    return res.send({ success: true, message: "User Created Successfully!" });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false, error: "Something Went Wrong!" });
  }
};

export const checkUserAleradySignIn = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.trainCookie || "";
    const value = jwt.verify(token, process.env.secretKey || "");
    console.log("Value  ", value);
    if (!value) {
      return res.send({ success: false });
    }
    const { userEmail } : any = value;
    const data = await model.userMasterTable.findAll({
      where : {
        UserEmail : userEmail
      }
    });
    return res.send({ success: true, data:data[0] });
  } catch (error) {
    console.log("Error  ", error);
    return res.send({ success: false });
  }
}