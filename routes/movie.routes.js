const express = require('express');
const { createMovie, getMovies, getSingleMovie, updateMovie, deleteMovie } = require('../controller/movie.controller');
const upload = require('../middleware/fileUploads');
const router = express.Router();

router.post('/new', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), createMovie);
router.get('/', getMovies);
router.get('/:id', getSingleMovie);
router.put('/:id', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]),  updateMovie);
router.delete('/:id', deleteMovie);
router.patch('/movies/:id/toggle-availability');

module.exports = router;