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

대규모 앱이 되었을 때를 대비하기 위해서이다.<br>
하나의 컴퓨터 내에 프론트 서버와 백엔드 서버가 있는 경우를 생각해보자.<br>
예를 들어 프론트 요청이 백 요청보다 더 많이 와서 서버를 스케일링해야 하는 경우, 프론트 서버와 백 서버가 동시에 증설이 되기 때문에 백 서버가 불필요하게 추가되는 문제가 발생한다.

프론트 서버와 백엔드 서버를 각각의 컴퓨터로 분리하는 경우에는 프론트 서버를 담당하는 컴퓨터만 추가하면 되기 때문에 비용 면에서도 훨씬 절감이 될 수 있다.

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

분리한 라우터는 `app.js`에서 import한 후, `app.use`를 이용하여 연결한다. 이 때 prefix 부분에 `/api/post`를 넣음으로써 중복되는 부분을 밖으로 빼낼 수 있다.

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
- **sequelize**: **자바스크립트**로 SQL 조작할 수 있도록 도와주는 라이브러리

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

`config.json` 파일에는 MySQL과 연동할 때 사용되는 정보가 담겨있다. 여기서 `password` 부분과 `database` 부분을 수정한다.

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

이 때 charset과 collate을 `utf8mb4`와 `utf8mb4_general_ci`로 작성해야 이모티콘까지 입력이 가능해진다.

---

## 시퀄라이즈 관계 설정하기

`static associate` 메서드 내에서 다른 모델과의 관계를 작성한다.

1. **1 : N**

User-Post 같은 `1대다` 관계인 경우 `belongsTo`가 작성된 Post 테이블 속성에 `UserId`와 `PostId` 컬럼이 추가된다.

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

**중간 테이블**을 통해 '해시태그를 포함하는 게시글' 또는 '게시글 내의 해시태그'를 조회할 수 있게 된다.

### User-Post 간의 "**좋아요**" 관계(**다대다**)

User-Post 간의 "**좋아요**" 관계를 위한 중간 테이블명을 `through`를 통해 지정할 수 있다. 또 `as`를 사용해서 테이블의 별칭을 지정할 수 있는데, `post.getLiker()`, `user.getLiked()`와 같이 별칭을 이용해 '게시글에 좋아요를 누른 사람'과 '유저가 좋아요를 누른 게시글'을 조회할 수 있다.

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

예를 들어 *hero*의 팔로워를 찾는다고 가정해보자. 팔로워 입장에서는 *hero*를 **팔로잉**한 것이므로 `Following` 컬럼에서 *hero*를 찾는 것이 우선이다. 그러면 대응되는 `Follower` 컬럼에 위치한 *zero*와 *nero*가 바로 *hero*의 팔로워가 되는 것이다.

<br>

![image](https://user-images.githubusercontent.com/85874042/234910859-89e44869-818e-457c-b8a8-61275c4e0446.png)

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

> 같은 모델 간의 관계가 다대다를 갖는 경우, 반드시 `foreignKey`가 필요한데, 테이블 두 개가 서로 같기 때문에 중간 테이블의 두 컬럼이 서로 중복된 이름을 가지기 때문이다.<br>
> 그렇기 때문에 별칭으로 지정한 `Followers` 테이블의 경우 `foreignKey` 값으로 `FollowingId`가 들어있어야 하고, `Followings` 테이블의 경우 `foreignKey` 값으로 `FollowerId`가 들어있어야 한다.

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

db.sequelize = sequelize; // 1

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

다른 출처로 요청을 보내게 되면 출처 비교 후 다른 출처인 경우 차단을 하게 되는데, 이 행위를 서버가 아닌 **브라우저**에서 하게 된다. 즉, 서버 측에서는 정상적으로 응답을 하지만 이 응답을 브라우저에 받을 수 없게 되는 것이다.

그래서 브라우저에서 요청을 하는 것이 아닌 서버에서 다른 서버로 요청을 하는 경우는 CORS 정책이 적용되지 않는다.

### 서로 다른 출처 간의 리소스 공유 허용 설정을 하려면?

1. **Proxy**

브라우저에서 백엔드 서버로 요청을 보내는 것이 아닌, 먼저 출처가 같은 프론트 서버로 먼저 요청을 보내고 그 다음 프론트 서버에서 백엔드 서버로 요청을 보내는 방식이다.

2. 서버에서 **Access-Control-Allow-Origin** 허용

> 클라이언트에서 HTTP요청의 헤더에 `Origin`을 담아 전달하면 서버가 응답 헤더에 `Access-Control-Allow-Origin`를 담아서 클라이언트로 전달한다.<br>
> 클라이언트는 `Origin`과 `Access-Control-Allow-Origin`을 비교해서 차단 여부를 결정한다.

`npm i cors` 설치 후 `app.use(cors({ origin: * }))`로 모든 출처에서의 요청을 허용할 수 있다.<br>
`*` 대신 `true`로 설정해두면 요청을 보낸 주소가 `Access-Control-Allow-Origin`에 들어가게 되어 쿠키를 전송할 수 있게 된다.

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

`signUpAPI`의 백엔드 주소와 `http://localhost:3065` 부분이 겹치기 때문에 `sagas/index.js`에서

`axios.defaults.baseURL = "http://localhost:3065"`를 작성해서 중복을 제거한다.

2. 패키지 설치

`npm i passport passport-local bcrypt`

로그인 과정을 쉽게 처리할 수 있도록 도와주는 `passport` 및 username/email을 사용해 로그인 전략을 구현하는 `passport-local` 모듈을 설치한다.

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

6. 로그인 전략을 구체적으로 작성한다.

```js
// back/passport/localStrategy.js

const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "id", // req.body.id
        passwordField: "password", // req.body.password
      },
      async (id, password, done) => {
        try {
          const user = await User.findOne({ where: { id } });
          if (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result) {
              done(null, user);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
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

`usernameField`와 `passwordField`
