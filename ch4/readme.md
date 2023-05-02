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

프론트 서버는 서버 사이드 렌더링을 담당, 백엔드 서버는 API 요청 처리를 담당한다는 차이가 있다. (프론트 서버로부터 요청이 오면 데이터를 DB로부터 꺼내서 제공하는 역할)

### 프론트 서버와 백엔드 서버를 각각의 컴퓨터로 분리하는 이유는?

**대규모 앱**이 되었을 때를 대비하기 위해서이다.<br>
하나의 컴퓨터 내에 프론트 서버와 백엔드 서버가 있는 경우를 생각해보자.<br>
예를 들어 프론트 요청이 백 요청보다 더 많이 와서 서버를 스케일링해야 하는 경우, 프론트 서버와 백 서버가 동시에 증설이 되기 때문에 백 서버가 불필요하게 추가되는 문제가 발생한다.

프론트 서버와 백엔드 서버를 각각의 컴퓨터로 분리하는 경우에는 프론트 서버를 담당하는 컴퓨터만 추가하면 되기 때문에 비용 면에서도 훨씬 절감이 될 수 있다.

---

## 익스프레스로 라우팅하기

### 설치

`npm i express`

### 익스프레스를 사용하는 이유?

```js
const http = require("http");

const server = http.createServer((req, res) => {
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

기존 http 모듈에서 라우팅을 구현하려면 `req.method`와 `req.url`을 사용하여 수많은 `if-else` 문으로 분기 처리를 해야하기 때문에 코드가 복잡해진다.

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

express를 이용한다면 `app.method(prefix, handler)` 방식을 통해 간단하게 요청을 보낼 수 있게 된다.

### postman / swagger

**postman**은 개발한 API를 테스트하고, 테스트 결과를 공유하여 API 개발의 생산성을 높여주는 도구이다.

![image](https://user-images.githubusercontent.com/85874042/234747152-afccbfdf-48a3-423e-a743-2c2774f23d71.png)

주소창에 접근 시 바로 실행되지 않는 post나 put, delete 등의 요청은 위와 같이 postman을 이용해 간단하게 테스트를 할 수 있다.

**swagger**는 프론트엔드와 백엔드 사이에 데이터를 어떤 방식으로 주고받을지에 대한 API 명세를 도와주는 도구이다.

---

## 익스프레스 라우터 분리하기

```js
// routes/post.js
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, content: "test1" },
    { id: 2, content: "test2" },
    { id: 3, content: "test3" },
  ]);
});

router.post("/", (req, res) => {
  res.json({ id: 4, content: "test4" });
});

export default router;
```

`express.Router()`를 통해 만든 router 객체를 이용하여 라우터를 분리할 수 있다.

```js
// app.js
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

분리한 라우터를 `app.js`에서 import한 후, `app.use`를 이용하여 연결한다. 이 때 prefix 부분에 `/api/post`를 넣음으로써 중복되는 부분을 밖으로 빼낼 수 있다.

```js
router.post("/", (req, res) => {
  res.json({ id: 4, content: "test4" });
});
```

이 부분은 이제 `POST /api/post`와 동일한 의미를 가지게 된다.

---

## MySQL과 Sequelize 연결하기

### 설치

MySQL 설치 후,
`npm i sequelize sequelize-cli mysql2` 패키지 설치

- **mysql2**: node와 MySQL을 연결해주는 드라이버
- **sequelize**: JavaScript로 SQL을 조작할 수 있도록 도와주는 라이브러리

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

config 폴더 내에 있는 `config.json` 파일에는 MySQL과 연동할 때 사용되는 정보가 담겨있다. 여기서 `password` 부분과 `database` 부분을 수정한다.

```js
// models/index.js

const Sequelize = require("sequelize");

// 배포 시에는 process.env.NODE_ENV 값을 production으로 설정
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

// config.json에 있는 DB 값으로 새로운 Sequelize 객체를 생성
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

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

이 때 charset과 collate을 `utf8mb4`와 `utf8mb4_general_ci`로 작성하는 경우 이모티콘까지 입력이 가능해진다.

---

## 시퀄라이즈 관계 설정하기

`static associate` 메서드 내에서 다른 모델과의 관계를 작성한다.

1. **1 : N**

User-Post 같은 `1대다` 관계인 경우 `belongsTo`가 작성된 Post의 테이블에 `UserId` 컬럼이 추가된다.

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
(중간 테이블명을 `through`를 통해 지정할 수 있으며, 보통 `PostHashtag`와 같이 두 테이블명을 합침)

```js
// models/post.js
static associate(db) {
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
  }
```

```js
// models/hashtag.js
static associate(db) {
    db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });
  }
```

**중간 테이블**을 통해 '특정 해시태그를 포함하는 게시글' 또는 '특정 게시글 내에 있는 해시태그'를 조회할 수 있게 된다.

### User-Post 간의 "**좋아요**" 관계(**다대다**)

`as`를 사용해서 테이블의 별칭을 지정할 수 있는데, `post.getLiker()`, `user.getLiked()`와 같이 별칭을 이용해 '게시글에 좋아요를 누른 사람'과 '유저가 좋아요를 누른 게시글'을 조회할 수 있다.

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

### User-User 간의 "**팔로우**" 관계(**다대다**)

예를 들어 *hero*의 팔로워를 찾는다고 가정해보자. 팔로워 입장에서는 *hero*를 **팔로잉**한 것이므로 `FollowingId` 컬럼에서 *hero*를 찾는 것이 우선이다. 그러면 대응되는 `FollowerId` 컬럼에 위치한 *zero*가 바로 *hero*의 팔로워가 되는 것이다.

<br>

![image](https://user-images.githubusercontent.com/85874042/235387238-f664c5d4-73b9-49b2-930b-d79dbcec315a.png)

```js
// models/user.js
static associate(db) {
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followers",
      foreignKey: "FollowingId",
    });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followings",
      foreignKey: "FollowerId",
    });
  }
```

> 같은 모델 간의 관계가 다대다를 갖는 경우, 반드시 `foreignKey`가 필요한데, 테이블 두 개가 서로 같기 때문에 중간 테이블의 두 컬럼이 서로 중복된 이름을 가지기 때문이다.

> 별칭으로 지정한 `Followers` 테이블의 경우 `foreignKey` 값으로 `FollowingId`가 들어있어야 하고, `Followings` 테이블의 경우 `foreignKey` 값으로 `FollowerId`가 들어있어야 한다. 

### Post-Post 간의 "**리트윗**" 관계

`db.Post.belongsTo(db.Post)` 일 때는 포스트 테이블에 `postId` 컬럼이 추가되기 때문에 리트윗된 게시글이라는 것을 구분할 수 없다. 따라서 `{ as: "Retweet" }`를 추가함으로써 `RetweetId`로 컬럼명을 바꾸도록 한다.

```js
static associate(db) {
  db.Post.belongsTo(db.Post, { as: "Retweet" });
}
```

---

## 시퀄라이즈 sync + nodemon

```js
// models/index.js
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
// 1
db.sequelize = sequelize;
// 2
db.User = User;
db.Post = Post;
db.Comment = Comment;
db.Image = Image;
db.Hashtag = Hashtag;

// static initiate 메서드 실행
User.initiate(sequelize);
Post.initiate(sequelize);
Comment.initiate(sequelize);
Image.initiate(sequelize);
Hashtag.initiate(sequelize);

// static associate 메서드 실행
User.associate(db);
Post.associate(db);
Comment.associate(db);
Image.associate(db);
Hashtag.associate(db);

module.exports = db;
```

1. `sequelize`를 db 객체에 저장하고 이를 `app.js`에서 import하면 `sequelize.sync()`를 통해 node와 db를 연결할 수 있게 된다.
2. db 객체를 require함으로써 모델에 접근할 수 있다.

### 실행

`nodemon`을 이용하여 변경사항을 실시간으로 반영한다.

1. `npx sequelize db:create`로 데이터베이스 생성
2. `npm i -D nodemon` 패키지 설치
3. `package.json`의 scripts에` { "dev": "nodemon app" }` 입력
4. `npm run dev`

---

## 회원가입 구현하기

### 흐름

> **브라우저**(3060) <-> **프론트 서버**(3060) <-> **백엔드 서버**(3065) <-> **MySQL**(3306)

브라우저와 프론트 서버는 실제로는 같은 프로그램이지만, 브라우저는 프론트 서버로부터 전달받은 HTML, CSS, Javascript 파일을 이용해 화면을 직접 렌더링한다는 점에서 차이가 있다.

1. 프론트단에서 `signUpAPI` 작성

```js
// front/sagas/user.js
function signUpAPI(data) {
  return axios.post("http://localhost:3065/user", data);
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data);
    yield put({
      type: SIGN_UP_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: SIGN_UP_FAILURE,
      error: err.response.data,
    });
  }
}
```
post 요청을 보낼 백엔드 서버의 위치는 `http://localhost:3065/user`이다.

2. API 요청을 받을 `userRouter` 생성

```js
// back/routes/user.js
const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (exUser) {
      return res.status(403).send("이미 가입된 이메일입니다.");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    res.status(201).send("ok");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
```
_403_(forbidden), _201_(created)와 같이 status code를 작성해주는 것이 좋다.<br>
`bcrypt.hash`의 라운드 수는 10~13 사이로 설정한다.

3. `app.js`에서 `userRouter` 연결 및 `req.body`에 있는 데이터를 파싱하기 위한 미들웨어(**json**/**urlencoded**) 추가

- `express.json`: 프론트에서 보낸 json 형식의 데이터를 `req.body`에 넣어줌
- `express.urlencoded`: 프론트에서 보낸 `x-www-form-urlencoded` 형식의 데이터를 `req.body`에 넣어줌 - 폼 제출하는 경우 생성됨

> 위의 두 미들웨어의 위치는 반드시 라우터보다 위에 있어야 한다.<br> 미들웨어 특성상 **위에서 아래로 순차적으로 실행**되기 때문에 라우터보다 아래에 위치한 경우, 두 미들웨어가 실행이 되지 않아 `req.body`가 `undefined`가 되어버린다.

---

## CORS 문제 해결하기

백엔드 서버와 프론트 서버를 모두 실행시킨 후 브라우저에 접속해 "가입하기" 버튼을 클릭하게 되면

```
Access to XMLHttpRequest at 'http://localhost:3065/user' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

이런 식으로 `CORS policy`에 의해 차단되었다는 에러메시지가 뜨게 된다. 브라우저에서 백엔드 서버에 요청을 할 수 없게 된 것이다.

### CORS란?

Cross-Origin Resource Sharing의 줄임말로, **서로 다른 출처의 리소스 공유에 대한 허용/비허용 정책**을 의미한다.

> **출처(origin)** -> protocol + host + port<br>
> 프론트 서버의 출처(origin)는 `http://localhost:3065`이고, 백엔드 서버의 출처는 `http://localhost:3000`이기 때문에 서로 port가 달라 다른 출처를 가지게 된다.

요청을 보내게 되면 출처 비교 후 다른 출처인 경우 차단을 하게 되는데, 이 행위를 서버가 아닌 **브라우저**에서 하게 된다. 즉, 서버 측에서는 정상적으로 응답을 하지만 이 응답을 브라우저에 받을 수 없게 되는 것이다.

그래서 브라우저에서 요청을 하는 것이 아닌 서버에서 다른 서버로 요청을 하는 경우는 CORS 정책이 적용되지 않는다.

### 서로 다른 출처 간에 리소스를 공유하려면?

1. **Proxy**

브라우저에서 백엔드 서버로 요청을 보내는 것이 아닌, 먼저 출처가 같은 프론트 서버로 먼저 요청을 보내고 그 다음 프론트 서버에서 백엔드 서버로 요청을 보내는 방식이다.

2. 서버에서 **Access-Control-Allow-Origin** 허용

> 클라이언트에서 HTTP요청의 헤더에 `Origin`을 담아 전달하면 서버가 응답 헤더에 `Access-Control-Allow-Origin`를 담아서 클라이언트로 전달한다.<br>
> 클라이언트는 `Origin`과 `Access-Control-Allow-Origin`을 비교해서 차단 여부를 결정한다.

`npm i cors` 설치 후 `app.use(cors({ origin: * }))`로 모든 출처에서의 요청을 허용할 수 있다.<br>

`*` 대신 `true`로 설정해두면 요청을 보낸 주소가 `Access-Control-Allow-Origin`에 들어가게 되어 쿠키 전송이 가능해진다.

cors 적용 후 요청을 보내면

![image](https://user-images.githubusercontent.com/85874042/235072647-e2eda362-748d-416f-9285-087130740a6a.png)

POST 말고도 OPTIONS 요청도 포함되어 있는데 이 OPTIONS 요청에서 `Origin`과 `Access-Control-Allow-Origin`을 비교하게 된다.

### 회원가입 후 메인페이지 이동

```js
// front/pages/signup.js

const signup = () => {
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError } = useSelector((state) => state.user);

  useEffect(() => {
    if (signUpDone) {
      Router.push("/");
      dispatch({ type: SIGN_UP_RESET });
    }
  }, [signUpDone]);

  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
      dispatch({ type: SIGN_UP_RESET });
    }
  }, [signUpError]);
  ...
}
```

회원가입 완료 후에는 메인페이지로 이동되도록 하고, 중복된 이메일로 가입하는 경우 `signUpError`에 들어있는 에러메시지가 보이도록 한다.

```js
// front/reducers/user.js
case SIGN_UP_RESET:
  draft.signUpDone = false;
  draft.signUpError = false;
  break;
```

가입 후, 또는 오류메시지를 보여준 후에 `SIGN_UP_RESET` 액션을 dispatch해서 `signUpDone`과 `signUpError`를 `false`로 변경해줘야 한다.

---

## 패스포트로 로그인하기

1. 프론트단에서 `logInAPI` 작성

```js
// front/sagas/user.js

function logInAPI(data) {
  return axios.post("http://localhost:3065/user/login", data);
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOG_IN_FAILURE,
      error: err.response.data,
    });
  }
}
```

이 때 `signUpAPI`의 백엔드 주소와 `http://localhost:3065` 부분이 겹치기 때문에 `sagas/index.js`에서

`axios.defaults.baseURL = "http://localhost:3065"`를 작성하여 중복을 제거한다.

2. 패키지 설치

`npm i passport passport-local bcrypt`

로그인 과정을 쉽게 처리할 수 있도록 도와주는 `passport` 및 username / password을 사용해 로그인 전략을 구현하는 `passport-local` 모듈을 설치한다.

3. passport 폴더를 만들고 그 안에 passport 설정 파일인 `index.js`를 작성한다.

```js
// back/passport/index.js

const passport = require("passport");
const local = require("./localStrategy");

module.exports = () => {
  passport.serializeUser(() => {});

  passport.deserializeUser(() => {});

  local();
};
```

4. 로그인 전략을 세우는 부분은 `localStrategy.js`에서 작성한다.

```js
// back/passport/localStrategy.js

const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");

module.exports = () => {
  passport.use(new LocalStrategy());
};
```

5. passport 설정 파일(`index.js`)을 실행시키는 부분을 `app.js`에서 작성한다.

```js
// back/app.js
...
const passportConfig = require("./passport");
...
passportConfig();
```

6. 다시 `localStrategy.js`로 가서 로그인 전략을 구체적으로 작성한다.

```js
// back/passport/localStrategy.js

const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // req.body.email
        passwordField: "password", // req.body.password
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });
          if (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result) {
              done(null, user);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { message: "존재하지 않는 이메일입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
```

`new LocalStrategy`의 첫 번째 인수에 있는 `usernameField`와 `passwordField`에는 로그인 폼 제출 시 프론트로부터 `req.body`로 받은 데이터의 속성명을 넣어준다.

그리고 두 번째 인수에서 로그인 전략을 세울 수 있는데, 여러 상황에 따라 `done(error, user, options)` 함수에 넣어주는 인수가 달라진다.

* `error` : 서버 측에서 에러가 발생한 경우 error 객체 담아 전송, 나머지 경우는 null
* `user` : 로그인이 성공했을 경우에 user 객체 담아 전송, 실패 시 false
* `options` : 로그인이 실패했을 때 그 이유를 담으려는 경우에 작성

이메일이 있는지를 먼저 찾음<br>
-> 존재하지 않는 경우 `done(null, false, { message: "존재하지 않는 이메일입니다." })` 호출<br>
-> 존재하는 경우 `bcrypt.compare` 메서드를 통해 비밀번호가 일치하는지 검사<br>
-> 일치하지 않는 경우 `done(null, false, { message: "비밀번호가 일치하지 않습니다." })` 호출<br>
-> 일치하는 경우 `done(null, user)` 호출<br>
-> 도중에 서버 에러가 발생할 경우 `done(error)` 호출

로그인 요청이 들어오면 `passport.authenticate("local")`를 통해 로그인 전략이 수행되고, 이후 호출되는 `done` 함수는 `passport.authenticate`의 두 번째 인수인 callback으로 들어가게 된다.
```js
// back/routes/user.js
...
router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
      if (error) {
        console.error(error);
        return next(error);
      }
      if (info) {
        // 401: Unauthorized(미인증)
        return res.status(401).send(info.message);
      }
      return req.login(user, async (loginError) => {
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }
        return res.status(200).json(user);
      })
    })(req, res, next);
  }
);
...
```
* `passport.authenticate` 메서드는 req, res, next를 인수로 받지 않기 때문에 **미들웨어 확장법**을 이용해서 req, res, next에 접근할 수 있도록 할 수 있다.

* `req.login` 메서드는 로그인 성공 시 `passport.authenticate`에 의해 자동으로 호출되며, `req.login`에 의해 `passport.serializeUser`가 호출되어 세션 객체에 로그인한 유저 정보가 저장된다. (후술)

---

## 쿠키/세션과 전체 로그인 흐름

### 쿠키/세션

서버에 로그인한 유저 정보가 저장된다고 해서 브라우저에 똑같이 반영되지 않기 때문에 유저 정보를 브라우저로 넘겨주는 과정이 필요하다. 

이 때 **쿠키**와 **세션**이 사용되는데, 사용자 정보는 서버의 **세션** 객체에 저장되고 브라우저에는 세션 객체를 조회할 수 있는 **쿠키**가 전달된다.

이제 서버는 요청이 올 때마다 클라이언트로부터 쿠키를 수집하여 내부의 세션 저장소에서 세션 ID를 조회해 현재 로그인한 유저를 식별할 수 있게 된다.

#### 쿠키/세션 설정

`npm i express-session cookie-parser dotenv`

```js
// back/app.js
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const dotenv = require("dotenv");

dotenv.config();

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: process.env.COOKIE_SECRET,
}));
app.use(passport.initialize());
app.use(passport.session());
```

* `passport.initialize`: `req`에 `isAuthenticated`, `login`, `logout` 메서드와 같은 passport 설정을 심음
* `passport.session` : `req.session` 객체에 사용자 정보를 저장하는 역할, 반드시 `express-session`을 사용하는 미들웨어 다음에 위치해야 함

#### dotenv

`req.login`가 성공적으로 수행되면 

![image](https://user-images.githubusercontent.com/85874042/235393730-87fc30b2-bbc7-4859-8263-e2c786c2d7ff.png)

이렇게 브라우저에게 세션 객체에 접근 가능한 키값을 쿠키로 제공하는데 문제는 이 값이 user 데이터를 기반으로 만들어진 것이라는 점이다.

소스코드가 해커에 의해 노출될 경우 secret 값이 하드코딩되어 있다면 이 secret 값과 전달받은 쿠키를 이용해 데이터를 복원할 수 있기 때문에 secret 값을 다른 파일로 옮겨서 관리할 필요가 있다.

`dotenv` 모듈 설치 후 `.env` 파일에 키값을 저장한 후 `dotenv.config()`를 하면 `.env` 내 키값에 접근이 가능해진다. 이제 이 `.env` 파일만 잘 관리하면 되기 때문에 유지보수가 훨씬 간편해질 것이다.

### 로그인 과정

1. userSaga에서 `/user/login`으로 로그인 요청을 보냄
2. userRouter에서 이를 감지하고 `passport.authenticate` 메서드 호출
3. local 로그인 전략(`localStrategy`) 수행
4. 로그인 성공 시 user 객체와 함께 `req.login` 호출
5. `req.login`에 의해 `passport.serializeUser` 호출

```js
// back/passport/index.js

const passport = require("passport");
const { User } = require("../models");
const local = require("./localStrategy");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user);
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();
};
```
6. `done(null, user.id)`이 실행되면 세션(`req.session`) 객체에는 사용자 id 값만 저장됨(**메모리 최적화**를 위해)
7. `done` 실행 후 `req.login`의 callback 함수가 실행되어 프론트에 쿠키와 유저 정보 넘겨준 후 서버 로직이 종료됨
9. 프론트에서는 userSaga에서 넘겨받은 유저 정보와 함께 `LOG_IN_SUCCESS`를 dispatch한 다음 userReducer를 통해 `me` 객체에 유저 정보를 넣어준다. (끝)

### 로그인 이후 과정

1. 모든 요청에 대해 `passport.session` 미들웨어가 `passport.deserializeUser` 메서드 호출
2. `req.session`에 저장된 아이디로 데이터베이스에서 사용자 조회
3. 조회된 사용자 정보를 `req.user`에 저장
4. 라우터에서 `req.user` 객체 사용 가능

### 로그아웃 과정

```js
// back/routes/user.js
...
router.post("/logout", isLoggedIn, (req, res) => {
  req.logout((error) => {
    if (error) {
      console.error(error);
      return next(error);
    } else {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(200).send("ok");
      });
    }
  });
});
...
```
로그아웃 요청이 들어오면 `req.session.destroy` 메서드로 세션 파괴 및 `res.clearCookie`로 쿠키를 삭제한다. 

## 로그인 문제 해결하기

### `me` 객체 수정

![image](https://user-images.githubusercontent.com/85874042/235410588-971cf72d-13c8-4337-a66e-691ca42d9bb8.png)

![image](https://user-images.githubusercontent.com/85874042/235410513-5cd21a86-d5df-4d96-9b5f-5db2a456ded9.png)

서버로부터 전달받은 `me` 객체의 경우 다른 테이블과 조인이 되지 않은 상태이기 때문에 `me.Posts`, `me.Followings`을 가져오는 과정에서 에러가 발생하게 된다.

```js
// back/routes/user.js
...
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      console.error(error);
      return next(error);
    }
    if (info) {
      return res.status(401).send(info.message);
    }
    return req.login(user, async (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      const fullUserWithoutPassword = await User.findByPk(user.id, {
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            // hasMany이기 때문에 복수형이 되어 me.Posts가 된다.
            model: Post,
          },
          {
            model: User,
            as: "Followings",
          },
          {
            model: User,
            as: "Followers",
          },
        ],
      });
      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next);
});
```
따라서 `include`를 통해 관계있는 테이블을 조인함과 동시에 `attributes`의 `exclude`로 비밀번호 속성은 제외하고 가져올 수 있도록 한다.

![image](https://user-images.githubusercontent.com/85874042/235411652-e8cf1730-dfe9-4e5d-9d92-913f18baa785.png)

### 로그인 실패 시의 로직 추가 - `alert` 메시지 출력

```js
// front/components/LoginForm.js
const LoginForm = () => {
  ...
  const { logInLoading, logInError } = useSelector((state) => state.user);

  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);
  ...
}
```

### 로그인이 되어 있는 동안 회원가입 페이지 접근 차단
```js
// front/pages/signup.js
const signup = () => {
  const { signUpLoading, signUpDone, signUpError, logInDone } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (logInDone) {
      Router.replace("/");
    }
  }, [logInDone]);
}
```
* `Router.replace`의 경우: 홈 -> 회원가입 페이지 -> 리다이렉트 페이지(`/`) -> **뒤로가기** -> 홈
* `Router.push`의 경우: 홈 -> 회원가입 페이지 -> 리다이렉트 페이지(`/`) -> **뒤로가기** -> 회원가입 페이지
---

## 미들웨어로 라우터 검사하기

유저가 로그인을 했는데 다시 로그인을 하려고 한다거나, 로그인이 되지 않았는데도 로그아웃을 하려는 경우 문제가 발생한다.

**로그인 여부를 검사**하는 미들웨어를 만들어 라우터에 장착한다.

```js
// back/routes/middlewares.js

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send("로그인이 필요합니다.");
  }
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send("로그인하지 않은 사용자만 접근이 가능합니다.");
  }
}
```

로그아웃 요청을 받은 경우 로그인된 사용자인 경우(`isLoggedIn`)에만 `next()` 메서드에 의해 다음 미들웨어가 호출되고, 만약 아니라면 프론트에게 "로그인이 필요합니다."라는 메시지만 전달되고 다음 미들웨어는 호출되지 않는다.
* `next()`: 다음 미들웨어 호출
* `next(error)`: 에러처리 미들웨어 호출

---

## 게시글, 댓글 작성하기

`dummyPost`, `dummyComment` 대신 실제로 유저가 작성한 게시글과 댓글을 DB에 저장한다.

### 게시글 작성 로직
1. `front/components/PostForm.js`

`dispatch({ type: ADD_POST_REQUEST, data: text })`

2. `front/sagas/post.js`

`axios.post("/post", { content: data })`

3. `back/routes/post.js`

```js
router.post("/", async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      userId: req.user.id,
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
```

4. `front/sagas/post.js`

json 형식으로 받은 데이터는 result.data로 접근 가능<br>
`{ type: ADD_POST_SUCCESS, data: result.data }` + `{ type: ADD_POST_TO_ME, data: result.data.id }`를 dispatch

5. `front/reducers/post.js`

`draft.mainPosts.unshift(action.data)`로 최상단에 게시글 추가

### 댓글 작성 로직

1. `front/components/PostForm.js`

`dispatch({ type: ADD_COMMENT_REQUEST, data: { content: commentText, postId: post.id, userId: id } })`

2. `front/sagas/post.js`

``axios.post(`/post/${data.postId}/comment`, data)``

3. `back/routes/post.js`

```js
router.post("/:postId/comment", async (req, res, next) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      postId: req.body.postId,
      userId: req.body.userId,
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
```

4. `front/sagas/post.js`

json 형식으로 받은 데이터는 result.data로 접근 가능<br>
`{ type: ADD_COMMENT_SUCCESS, data: result.data }`를 dispatch

5. `front/reducers/post.js`

`post.Comments.unshift(action.data);`로 작성한 게시글의 최상단에 댓글 추가

---

## credentials로 쿠키 공유하기

### `req.user` 값을 받아올 수 없는 문제

백엔드 서버와 브라우저 간의 **origin**이 다른 경우에, CORS 문제가 발생할 뿐만 아니라 쿠키 또한 전송이 되지 않는다.

### 설정

```js
// back/app.js
app.use(cors({ origin: true, credentials: true }));
```
credentials를 `true`로 설정 -> 이 때 CORS policy에 의해 origin에는 wildcard가 아닌 반드시 주소를 명시적으로 적어줘야 한다. (`true`도 가능)

```js
// front/sagas/index.js
axios.defaults.withCredentials = true;
```
프론트에서도 똑같이 withCredential을 `true`로 설정하게 되면 쿠키 전송이 가능해진다.

---

## 내 로그인 정보 매번 불러오기

### 새로고침할 때마다 로그인이 풀리는 문제

새로고침을 하게 되면 스토어 값이 모두 초기화가 된다. 따라서 `me`가 `null`이 되기 때문에 `UserProfile` 대신 `LoginForm` 컴포넌트가 나타나게 되는 것이다.


