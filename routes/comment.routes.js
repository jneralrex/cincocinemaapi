const express = require("express");
const { addComment, removeComment,getCommentForMovie, getCommentByUser } = require("../controller/comment.controller");

const router = express.Router();

router.post("/", addComment);

router.delete("/", removeComment);

router.get("/movie/:movieId", getCommentForMovie);

router.get("/userComments/:userId", getCommentByUser);

module.exports = router;
