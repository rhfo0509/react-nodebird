const Sequelize = require("sequelize");

class Image extends Sequelize.Model {
  static initiate(sequelize) {
    Image.init(
      {
        src: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
      },
      {
        sequelize,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Image.belongsTo(db.Post);
  }
}

module.exports = Image;