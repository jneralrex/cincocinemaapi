const express = require('express');
const rowController = require('../controller/rowController');
const verifyTokensAndRole = require('../utils/authToken.verify');
const router = express.Router();

router.post('/rows',  rowController.createRow);
router.get('/rows', rowController.getAllRows); 
router.get('/rows/:id', rowController.getRowById); 
router.put('/rows/:id',  rowController.updateRow); 
router.delete('/rows/:id', rowController.deleteRow); 

module.exports = router;
