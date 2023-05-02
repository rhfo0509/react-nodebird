const express = require("express");

const { Post, Image, User, Comment } = require("../models");

const router = express.Router();

router.post("/:postId/comment", async (req, res, next) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      PostId: req.body.postId,
      UserId: req.body.userId,
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    const fullPost = await Post.findByPk(post.id, {
      include: [
        { model: Image },
        { model: User },
        { model: Comment },
      ]
    })
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
