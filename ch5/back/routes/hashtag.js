const express = require("express");
const { Post, Comment, Image, Hashtag, User } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/:tag/posts", async (req, res, next) => {
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
        {
          model: Hashtag,
          where: { name: decodeURIComponent(req.params.tag) },
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
