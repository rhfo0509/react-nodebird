const express = require("express");

const { Post, Image, User, Comment } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

router.patch("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: Number(req.params.postId) },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    await post.addLikers(req.user.id);
    res.status(200).json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:postId/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: Number(req.params.postId) },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    await post.removeLikers(req.user.id);
    res.status(200).json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:postId/comment", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: Number(req.params.postId) },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    const comment = await Comment.create({
      content: req.body.content,
      PostId: post.id,
      UserId: req.user.id,
    });
    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{ model: User }],
    });
    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:postId", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: Number(req.params.postId) },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    await Post.destroy({
      where: { id: post.id },
    });
    res.status(200).json({ PostId: Number(req.params.postId) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        { model: Image },
        {
          model: Comment,
          include: [{ model: User, attributes: ["id", "nickname"] }],
        },
        { model: User, attributes: ["id", "nickname"] },
        { model: User, attributes: ["id"], as: "Likers" },
      ],
    });
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
