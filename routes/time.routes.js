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


router.get("/all-times",  getAllTimes);


router.get("/time/:id",  getTimeById);


router.post("/create-time", createTime);


router.put("/edit-time/:id", updateTime);


router.delete("/delete-time/:id",  deleteTime);

module.exports = router;
