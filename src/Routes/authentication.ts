import { signInFunc, signUpFunc } from "../Controller/Authentication";

const express = require("express");

const route = express.Router();

route.post("/signIn", signInFunc);
route.post("/signUp",signUpFunc);

export default route;