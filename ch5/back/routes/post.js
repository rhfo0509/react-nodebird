const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Post, Image, User, Comment, Hashtag } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

try {
  fs.accessSync("uploads");
} catch (error) {
  console.log("uploads 폴더가 없으므로 생성합니다.");
  fs.mkdirSync("uploads");
}

router.get("/:postId", async (req, res, next) => {
  try {
    console.log(req.params.postId);
    const post = await Post.findOne({
      where: { id: Number(req.params.postId) },
    });

    if (!post) {
      return res.status(404).json("존재하지 않는 게시글입니다.");
    }

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

    res.status(200).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:postId/retweet", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: Number(req.params.postId) },
      include: [
        {
          model: Post,
          as: "Retweet",
        },
      ],
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    if (post.UserId === req.user.id || post.Retweet?.UserId === req.user.id) {
      return res.status(403).send("자신의 글은 리트윗할 수 없습니다.");
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) {
      return res.status(403).send("이미 리트윗했습니다.");
    }
    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: "retweet",
    });
    const retweetWithPrevPost = await Post.findOne({
      where: { id: retweet.id },
      include: [
        {
          model: Post,
          as: "Retweet",
          include: [
            { model: User, attributes: ["id", "nickname"] },
            { model: Image },
          ],
        },
        { model: Image },
        {
          model: Comment,
          include: [{ model: User, attributes: ["id", "nickname"] }],
        },
        { model: User, attributes: ["id", "nickname"] },
        { model: User, attributes: ["id"], as: "Likers" },
      ],
    });
    res.status(201).json(retweetWithPrevPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

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
    // "UserId: req.user.id"을 통해 자기가 쓴 글인지 한 번 더 확인함으로써 보안을 강화
    const post = await Post.findOne({
      where: { id: Number(req.params.postId), UserId: req.user.id },
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

router.patch("/:postId", async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: Number(req.params.postId) },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }

    await Post.update(
      { content: req.body.content },
      { where: { id: post.id } }
    );
    const updatedPost = await Post.findByPk(post.id);
    
    const hashtags = req.body.content.match(/#[^\s]+/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() },
          })
        )
      );
      await updatedPost.setHashtags(result.map((v) => v[0]));
    }
    res.status(200).json({ PostId: post.id, content: req.body.content });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads");
    },
    filename(req, file, done) {
      // bear.png
      const ext = path.extname(file.originalname); // .png
      const basename = path.basename(file.originalname, ext); // bear
      done(null, basename + "_" + Date.now() + ext); // bear_1683178580347.png
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post(
  "/images",
  upload.array("image"),
  isLoggedIn,
  async (req, res, next) => {
    try {
      console.log(req.files);
      res.status(200).json(req.files.map((v) => v.filename));
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

router.post("/", upload.none(), isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s]+/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() },
          })
        )
      );
      await post.addHashtags(result.map((v) => v[0]));
    }
    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        const images = await Image.bulkCreate(
          req.body.image.map((image) => ({ src: image }))
        );
        await post.addImages(images);
      } else {
        const image = await Image.create({ src: req.body.image });
        await post.addImage(image);
      }
    }
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
