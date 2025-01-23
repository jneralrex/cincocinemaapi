const express = require('express');
const verifyTokensAndRole = require('../utils/authToken.verify');
const {
    createScreeningDate,
    getAllScreeningDates,
    getScreeningDateById,
    updateScreeningDate,
    deleteScreeningDate
} = require('../controller/date.controller');

const router = express();


router.get("/all-dates", verifyTokensAndRole, getAllScreeningDates);
router.get("/date/:id", getScreeningDateById);
router.post("/create-date", verifyTokensAndRole, createScreeningDate);
router.put("/edit-date/:id", verifyTokensAndRole, updateScreeningDate);
router.delete("/delete-date/:id", verifyTokensAndRole, deleteScreeningDate);

module.exports = router;
