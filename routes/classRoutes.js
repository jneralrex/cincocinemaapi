const express = require('express');
const classController = require('../controller/classController');
const verifyTokensAndRole = require('../utils/authToken.verify');
const router = express.Router();

router.post('/classes',   classController.createClass); 
router.get('/classes/:id', classController.getAllClasses); 
router.get('/classes/:id', classController.getClassById); 
router.put('/classes/:id',  classController.updateClass); 
router.delete('/classes/:id', classController.deleteClass); 

module.exports = router;
