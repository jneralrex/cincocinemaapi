const express = require('express');
const classController = require('../controller/classController');
const router = express.Router();

router.post('/classes', classController.createClass); 
router.get('/classes', classController.getAllClasses); 
router.get('/classes/:id', classController.getClassById); 
router.put('/classes/:id', classController.updateClass); 
router.delete('/classes/:id', classController.deleteClass); 

module.exports = router;
