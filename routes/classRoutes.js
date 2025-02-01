const express = require('express');
const classController = require('../controller/classController');
const verifyTokensAndRole = require('../utils/authToken.verify');
const router = express.Router();

router.post('/classes',   classController.createClass); 
router.get('/classes',verifyTokensAndRole, classController.getAllClasses); 
router.get('/classes/:id',verifyTokensAndRole, classController.getClassById); 
router.put('/classes/:id', verifyTokensAndRole, classController.updateClass); 
router.delete('/classes/:id',verifyTokensAndRole, classController.deleteClass); 

module.exports = router;
