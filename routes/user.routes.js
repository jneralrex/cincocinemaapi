const express = require("express");
const verifyTokensAndRole = require("../utils/authToken.verify");
const { getAllUsers, getUserById, updateUser, signUpload, updateProfilePhoto, rollBackImageWithErrors, deleteAccount  } = require("../controller/user.controller");


const userRouter = express.Router();

userRouter.get("/all-users", verifyTokensAndRole, getAllUsers);
userRouter.get("/individual-user/:id",  getUserById);
userRouter.patch("/individual-user/:id",  updateUser);
userRouter.post("/sign-upload",  signUpload);
userRouter.patch("/update/:id", updateProfilePhoto);
userRouter.post("/rollback", rollBackImageWithErrors);
userRouter.delete("/delete/:id",  deleteAccount);

module.exports = userRouter;
