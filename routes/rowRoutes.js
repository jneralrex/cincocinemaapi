const express = require('express');
const rowController = require('../controller/rowController');
const verifyTokensAndRole = require('../utils/authToken.verify');
const router = express.Router();

router.post('/rows', verifyTokensAndRole, rowController.createRow);
router.get('/rows',verifyTokensAndRole, rowController.getAllRows); 
router.get('/rows/:id',verifyTokensAndRole, rowController.getRowById); 
router.put('/rows/:id', verifyTokensAndRole, rowController.updateRow); 
router.delete('/rows/:id',verifyTokensAndRole, rowController.deleteRow); 

module.exports = router;
