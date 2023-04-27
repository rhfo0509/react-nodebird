const Sequelize = require('sequelize');
const User = require('./user');
const Post = require('./post');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

// new Sequelize(options...)로 DB와 연결 가능
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

// Sequelize Model을 DB에 연결
db.User = User;
db.Post = Post;

// db라는 객체에 User와 Comment 모델을 담아뒀습니다. 앞으로 db 객체를 require해서 User와 Comment 모델에 접근할 수 있습니다. User.initiate와 Comment.initiate는 각각의 모델의 static initiate 메서드를 호출하는 것입니다. 모델.init이 실행되어야 테이블이 모델로 연결됩니다. 다른 테이블과의 관계를 연결하는 static associate 메서드도 미리 실행해둡니다.
User.initiate(sequelize);
Post.initiate(sequelize);

User.associate(db);
Post.associate(db);

module.exports = db;