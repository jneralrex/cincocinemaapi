const express = require('express');
const verifyTokensAndRole = require('../utils/authToken.verify');
const {
    createTime,
    getAllTimes,
    getTimeById,
    updateTime,
    deleteTime
} = require('../controller/time.controller');

const router = express();


router.get("/all-times", verifyTokensAndRole, getAllTimes);


router.get("/time/:id",  getTimeById);


router.post("/create-time", verifyTokensAndRole, createTime);


router.put("/edit-time/:id", verifyTokensAndRole, updateTime);


router.delete("/delete-time/:id", verifyTokensAndRole, deleteTime);

module.exports = router;
