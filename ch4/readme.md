# 백엔드 노드 서버 구축하기

## 노드로 서버 구동하기

Q. 노드는 서버다?
> Node.jsⓇ는 서버가 아닌 Chrome V8 Javascript 엔진으로 빌드된 **자바스크립트 런타임**이다.

Q. 그럼 노드를 사용해서 어떻게 서버를 돌릴 수 있는가?
> 노드에서 `http` 모듈을 기본적으로 제공하는데, 이 `http` 모듈의 `createServer` 메서드를 사용해서 서버를 생성한 후 이를 노드가 실행하면 서버로 동작하게 된다.

### 백엔드 서버의 역할

`front/sagas` 폴더 내에 있는 파일을 보면
```js
function logInAPI(data) {
  return axios.post("/api/login", data);
}
```
이렇게 특정 주소로 API 요청을 보내는 함수를 볼 수 있는데, 여기서 `/api/login` 부분이 바로 백엔드 서버라고 할 수 있다.

프론트 서버는 서버 사이드 렌더링을 담당, 백엔드 서버는 API 요청 처리를 담당한다는 차이가 있다.  (프론트 서버로부터 요청이 오면 데이터를 데이터베이스로부터 꺼내서 제공하는 역할)

### 프론트 서버와 백엔드 서버를 각각의 컴퓨터로 분리하는 이유는?

대규모 앱이 되었을 때를 대비하기 위해서이다.<br>
하나의 컴퓨터 내에 프론트 서버와 백엔드 서버가 있는 경우를 생각해보자.<br>
예를 들어 프론트 요청이 백 요청보다 더 많이 와서 서버를 스케일링해야 하는 경우, 프론트 서버와 백 서버가 동시에 증설이 되기 때문에 백 서버가 불필요하게 추가되는 문제가 발생한다.

프론트 서버와 백엔드 서버를 각각의 컴퓨터로 분리하면, 프론트 서버를 처리하는 컴퓨터만 추가해준다면 비용 면에서도 훨씬 절감이 될 수 있다.

---

## 익스프레스로 라우팅하기

### 설치

`npm i express`을 통해 패키지 설치

### 익스프레스를 사용하는 이유?

```js
const http = require("http");

const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  if (req.method === 'GET') {
    if (req.url === '/api/posts') {
      ...
    }
  } else if (req.method === 'POST') {
    if (req.url === '/api/post') {
      ...
    }
  } else if (req.method === 'DELETE') {
    if (req.url === '/api/post') {
      ...
    }
  }
})
```
기존 http 모듈에서 라우팅을 구현하려면 `req.method`와 `req.url`을 사용하여 수많은 `if-else` 문으로 분기 처리를 하기 때문에 코드가 복잡해진다.

```js
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("hello express");
});

app.get("/api/post", (req, res) => {
  res.json([
    { id: 1, content: "test1" },
    { id: 2, content: "test2" },
    { id: 3, content: "test3" },
  ]);
});

app.post("/api/post", (req, res) => {
  res.json({ id: 4, content: "test4" });
});

app.listen(3065, () => {
  console.log("서버 실행 중");
});
```
express를 이용한다면 `app.get("/")`, `app.post("/api/post")`처럼 `req.method`와 `req.url`를 사용할 필요없이 간단하게 요청을 보낼 수 있게 된다.

### POSTMAN / swagger

**POSTMAN**은 개발한 API를 테스트하고, 테스트 결과를 공유하여 API 개발의 생산성을 높여주는 도구이다.

![image](https://user-images.githubusercontent.com/85874042/234747152-afccbfdf-48a3-423e-a743-2c2774f23d71.png)

주소창에 접근 시 바로 실행되는 get 요청이 아닌 post나 put, delete 등의 요청은 위와 같이 POSTMAN을 이용해 간단하게 테스트를 할 수 있다.

**swagger**는 프론트엔드와 백엔드 사이에 데이터를 어떤 방식으로 주고받을지에 대한 API 명세를 도와주는 도구이다. 

---

## 익스프레스 라우터 분리하기

```js
// routes/post.js
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, content: "test1"},
    { id: 2, content: "test2"},
    { id: 3, content: "test3"},
  ])
});

router.post("/", (req, res) => {
  res.json({ id: 4, content: "test4"});
})

export default router;
```

`express.Router()`를 통해 만든 router 객체를 통해 라우터를 분리할 수 있다.

```js
const express = require("express");
const postRouter = require("./routes/post");

const app = express();

app.get("/", (req, res) => {
  res.send("hello express");
});

app.use("/api/post", postRouter);

app.listen(3065, () => {
  console.log("서버 실행 중");
});
```

분리한 라우터는 `app.js`에서 import한 후, `app.use`를 이용해
연결할 수 있다. 이 때 prefix 부분에 `/api/post`를 넣음으로써 중복되는 부분을 밖으로 빼낼 수 있게 된다.
```js
router.post("/", (req, res) => {
  res.json({ id: 4, content: "test4"});
})
```

이 부분은 `POST /api/post`와 동일한 의미를 가지게 된다.

---

## MySQL과 Sequelize 연결하기

### 설치

MySQL 설치 후,
`npm i sequelize sequelize-cli mysql2` 패키지 설치
* **mysql2**: node와 MySQL을 연결해주는 드라이버
* **sequelize**: **자바스크립트**로 SQL 조작할 수 있도록 도와주는 라이브러리

### 설정

`npx sequelize init`을 하게 되면 config 및 models 폴더가 생김

```json
// config/config.json
{
  "development": {
    "username": "root",
    "password": "nodejsbook",
    "database": "react-nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "react-nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "react-nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```
MySQL과 연동할 때 사용되는 정보가 담겨있다. `password` 부분과 `database` 부분을 수정한다.

```js
// models/index.js

const Sequelize = require('sequelize');

// 배포 시에는 process.env.NODE_ENV 값을 production으로 설정
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

// sequelize에는 내부적으로 mysql2가 들어있어 config 값을 전달하면 node와 mysql을 연결해준다.
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

module.exports = db;
```

---

## 시퀄라이즈 모델 만들기

> 시퀄라이즈의 **Model**은 MySQL의 **Table**과 대응된다. 시퀄라이즈의 모델명을 **단수형**으로 작성하게 되면 MySQL의 테이블명이 **복수형**으로 저장된다. ex. `User` -> `users`

```js
// models/user.js
const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        email: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true,
        },
        nickname: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
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

  static associate(db) {}
}

module.exports = User;
```
`static initiate` 메서드 내의 `User.init`의 첫번째 인수로 테이블 컬럼의 속성을 작성하고, 두 번재 인수로는 테이블 자체에 대한 설정을 작성한다.

이 때 charset과 collate을 `utf8mb4`와 `utf8mb4_general_ci`로 작성하면 이모티콘까지 입력이 가능해진다.

---

## 시퀄라이즈 관계 설정하기

`static associate` 메서드 내에 다른 모델과의 관계를 작성한다.

1. **1 : N**

User-Post 같은 `1대다` 관계인 경우 `belongsTo`가 작성된 Post의 테이블 속성으로 `UserId`와 `PostId` 컬럼이 추가된다.
```js
// models/user.js
static associate(db) {
  db.User.hasMany(db.Post);
}
```
```js
// models/post.js
static associate(db) {
  db.Post.belongsTo(db.User);
}
```

2. **N : M**

Post-Hashtag 같은 `다대다` 관계인 경우 양쪽 다 `belongsToMany`로 작성하게 되면 `PostId`와 `HashtagId`를 담고 있는 중간 테이블이 시퀄라이즈에 의해 생성된다.<br>
(중간 테이블명을 지정하지 않을 시 `PostHashtag`와 같이 두 테이블명을 합침)

```js
// models/post.js
static associate(db) {
    db.Post.belongsToMany(db.Hashtag);
  }
```
```js
// models/hashtag.js
static associate(db) {
    db.Hashtag.belongsToMany(db.Post);
  }
```

**중간 테이블**을 통해 '해시태그에 해당하는 게시글' 또는 '게시글 내의 해시태그'를 조회할 수 있게 된다.

> User-Post 간의 좋아요 관계(**다대다**)를 위한 중간 테이블명을 `through`를 통해 지정할 수 있으며 `as`를 사용해서 `post.getLiker()`, `user.getLiked()`와 같이 '게시글에 좋아요를 누른 사람'과 '유저가 좋아요를 누른 게시글'을 조회할 수 있다.

```js
// models/user.js
static associate(db) {
  db.User.hasMany(db.Post);
  db.User.belongsToMany(db.Post, { through: "Like", as: "Liked" });
}
```
```js
// models/post.js
static associate(db) {
  db.Post.belongsTo(db.User);
  db.Post.belongsToMany(db.User, { through: "Like", as: "Likers" });
}
```

> User-User 간의 팔로우 관계(**다대다**)