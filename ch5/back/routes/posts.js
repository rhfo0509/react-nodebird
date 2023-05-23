const express = require("express");
const { Post, User, Comment, Image } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const where = {};
    if (Number(req.query.lastId)) {
      where.id = { [Op.lt]: Number(req.query.lastId) };
    }
    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [
        ["createdAt", "DESC"],
        [Comment, "createdAt", "DESC"],
      ],
      include: [
        { model: User, attributes: ["id", "nickname"] },
        {
          model: Comment,
          include: [{ model: User, attributes: ["id", "nickname"] }],
        },
        { model: Image },
        { model: User, attributes: ["id"], as: "Likers" },
        {
          model: Post,
          as: "Retweet",
          include: [
            { model: User, attributes: ["id", "nickname"] },
            { model: Image },
          ],
        },
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/related", async (req, res, next) => {
  try {
    const me = await User.findByPk(req.user.id);
    const followings = await me.getFollowings();

    const posts = await Post.findAll({
      order: [
        ["createdAt", "DESC"],
        [Comment, "createdAt", "DESC"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
          where: {
            id: {
              [Op.in]: followings.map((v) => v.id),
            },
          },
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ["id", "nickname"] }],
        },
        { model: Image },
        { model: User, attributes: ["id"], as: "Likers" },
        {
          model: Post,
          as: "Retweet",
          include: [
            { model: User, attributes: ["id", "nickname"] },
            { model: Image },
          ],
        },
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/unrelated", async (req, res, next) => {
  try {
    const me = await User.findByPk(req.user.id);
    const followings = await me.getFollowings();

    const posts = await Post.findAll({
      order: [
        ["createdAt", "DESC"],
        [Comment, "createdAt", "DESC"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
          where: {
            id: {
              [Op.notIn]: followings.map((v) => v.id).concat(req.user.id),
            },
          },
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ["id", "nickname"] }],
        },
        { model: Image },
        { model: User, attributes: ["id"], as: "Likers" },
        {
          model: Post,
          as: "Retweet",
          include: [
            { model: User, attributes: ["id", "nickname"] },
            { model: Image },
          ],
        },
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
