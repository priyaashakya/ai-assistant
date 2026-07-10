import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  askToAssistant,
  getCurrentUser,
  updateAssistant,
} from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);
userRouter.post("/asktoassistant", isAuth, askToAssistant);

export default userRouter;
