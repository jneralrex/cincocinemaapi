const express = require('express');
const seatController = require('../controller/seat.controller');
const verifyTokensAndRole = require('../utils/authToken.verify');
const router = express.Router();

router.post('/', seatController.createSeat);
router.get('/:id', seatController.getAllSeats);
router.get('/:id', seatController.getSeatById);
router.put('/:id', seatController.updateSeat);
router.delete('/:id', seatController.deleteSeat);

module.exports = router;
