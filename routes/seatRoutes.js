const express = require('express');
const seatController = require('../controller/seat.controller');
const verifyTokensAndRole = require('../utils/authToken.verify');
const router = express.Router();

router.post('/',verifyTokensAndRole, seatController.createSeat);
router.get('/',verifyTokensAndRole, seatController.getAllSeats);
router.get('/:id',verifyTokensAndRole, seatController.getSeatById);
router.put('/:id',verifyTokensAndRole, seatController.updateSeat);
router.delete('/:id',verifyTokensAndRole, seatController.deleteSeat);

module.exports = router;
