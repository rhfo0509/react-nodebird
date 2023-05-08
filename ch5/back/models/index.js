const Sequelize = require("sequelize");

const User = require("./user");
const Post = require("./post");
const Comment = require("./comment");
const Image = require("./image");
const Hashtag = require("./hashtag");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;

db.User = User;
db.Post = Post;
db.Comment = Comment;
db.Image = Image;
db.Hashtag = Hashtag;

User.initiate(sequelize);
Post.initiate(sequelize);
Comment.initiate(sequelize);
Image.initiate(sequelize);
Hashtag.initiate(sequelize);

User.associate(db);
Post.associate(db);
Comment.associate(db);
Image.associate(db);
Hashtag.associate(db);

module.exports = db;
