const { createAbout, getAllAbout, getAboutById, updateAbout, deleteAbout } = require('../controller/aboutUs.controller');
const upload = require('../middleware/fileUploads');
const express = require('express');
const router = express.Router();

router.get('/', getAllAbout);
router.post('/new', upload.single('image'), createAbout);
router.get('/:id', getAboutById);
router.put('/edit/:id', upload.single('image'), updateAbout);
router.delete('/:id', deleteAbout);

module.exports = router;