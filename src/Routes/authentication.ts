import { checkUserAleradySignIn, signInFunc, signUpFunc } from "../Controller/Authentication";

const express = require("express");

const route = express.Router();

route.post("/signIn", signInFunc);
route.post("/signUp",signUpFunc);
route.post("/checkUserIsAlreadyLogInOrNot" , checkUserAleradySignIn);

export default route;