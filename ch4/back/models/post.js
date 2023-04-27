const Sequelize = require("sequelize");

class Post extends Sequelize.Model {
  static initiate(sequelize) {
    Post.init(
      {
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        }
      },
      {
        sequelize,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci"
      }
    )
  }

  static associate(db) {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsToMany(db.Hashtag);
    db.Post.belongsToMany(db.User, { through: 'Like' });
  }
}

module.exports = Post;