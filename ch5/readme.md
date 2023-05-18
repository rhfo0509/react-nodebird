# Next.js 서버 사이드 렌더링

## 서버 사이드 렌더링 준비하기

### 기존 CSR 방식의 문제점

```js
// front/pages/index.js
const Home = () => {
  const dispatch = useDispatch();
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } =
    useSelector((state) => state.post);
  const { me } = useSelector((state) => state.user);

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  useEffect(() => {
    dispatch({ type: LOAD_MY_INFO_REQUEST });
    dispatch({ type: LOAD_POSTS_REQUEST });
  }, []);
  ...
  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
  );
}
```

`Home` 컴포넌트가 처음 렌더링될 때는 유저 정보와 게시글 정보가 들어있지 않은 상태(**빈 화면**) -> `useEffect`가 실행된 후 백엔드 서버로부터 데이터를 정상적으로 가져옴(**리렌더링되면서 화면에 데이터가 표시됨**)

이 때 두 과정 사이에 데이터의 공백이 발생하게 되는 문제가 발생한다.

기본적으로 두 번의 요청을 보내는 CSR 방식과는 달리
서버 사이드 렌더링(SSR) 방식은 한 번의 요청만으로 백엔드 서버로부터 바로 데이터를 받아올 수 있게 된다.

초기 로딩 속도가 빨라지기 때문에 더 이상 데이터가 비어 보이는 현상이 발생하지 않는다는 장점이 있다.

### 서버 사이드 렌더링을 위한 설정

`next-redux-wrapper`가 제공하는 메서드(`getServerSideProps`)를 통해 개별 페이지에 SSR을 적용시킬 수 있음

#### `getServerSideProps`

```js
// front/pages/index.js
const Home = () => { ... };

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    store.dispatch({ type: LOAD_MY_INFO_REQUEST });
    store.dispatch({ type: LOAD_POSTS_REQUEST });
  }
);
```

`Home` 컴포넌트 아래에 `getServerSideProps`라는 이름의 함수를 정의하면 `Home` 컴포넌트가 렌더링되기 이전에 `getServerSideProps`의 `store.dispatch`가 실행된다.<br>
실행된 결과는 `HYDRATE`가 받아서 리덕스 스토어 내에 변경된 상태를 반영한다.

### rootReducer 구조 변경

#### 문제점(1)

![image](https://user-images.githubusercontent.com/85874042/236751524-e09b0821-00f4-45fd-ac8a-251d99f0e4f7.png)

1. index 내에 index, user, post가 중첩해서 들어있음
2. 유저 및 게시글 데이터가 여전히 비어있음

#### 해결책(1)

```js
// front/reducers/index.js
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log("HYDRATE", action);
      return action.payload;
    default: {
      const combinedReducer = combineReducers({
        user,
        post,
      });
      return combinedReducer(state, action);
    }
  }
};
```

> `combineReducers`는 `(...reducers) => (state, action) => state`의 고차 함수 꼴이기 때문에 `combinedReducer`의 형태는 `(state, action) => state`가 된다.<br>
> 마지막에 `combineReducer(state, action)`로 호출하면 완성된 **state**가 나오게 된다.

#### 문제점(2)

![image](https://user-images.githubusercontent.com/85874042/236756722-8de783fc-a05a-41ab-a8b7-42236c2418d7.png)

REQUEST만 보내고 바로 끝나버리기 때문에 SUCCESS될 때의 데이터를 받지 못한다. 따라서 SUCCESS가 될 때까지 기다리는 장치가 필요하다.

#### 해결책(2)

```js
// front/pages/index.js
import { END } from "redux-saga";
...
const Home = () => { ... };

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    store.dispatch({ type: LOAD_MY_INFO_REQUEST });
    store.dispatch({ type: LOAD_POSTS_REQUEST });
    store.dispatch(END);
    await store.sagaTask.toPromise();
  }
);
```

**`END`**: `take`에 의해 대기중인 saga들을 모두 종료시킴 -> 단, saga의 하위 task가 아직 실행중인 경우에는 종료될 때까지 기다린다.

`task.toPromise()`: 모든 task가 실행을 마쳤을 때 resolve된 프로미스가 생성된다. 이를 통해 모든 saga들이 종료되었음을 보장한다.

---

## SSR 시 쿠키 공유하기

### 유저 정보가 정상적으로 반영되지 않는 현상

브라우저에서 백엔드 서버로 요청을 보낼 때는 브라우저에서 쿠키를 직접 담아서 전송<br>
그러나 서버 사이드 렌더링의 경우, 요청을 보내는 주체가 브라우저가 아닌 프론트 서버이다. 따라서 브라우저가 관여되지 않기 때문에 쿠키 또한 전송이 되지 않는다.

```js
// front/pages/index.js
export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, res }) => {
      const cookie = req ? req.headers.cookie : "";
      axios.defaults.headers.Cookie = "";
      if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
      }
      store.dispatch({ type: LOAD_MY_INFO_REQUEST });
      store.dispatch({ type: LOAD_POSTS_REQUEST });
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
);
```

브라우저로부터 전달받은 `req` 객체 내의 cookie를 `axios.defaults.headers.Cookie`에 추가함으로써 프론트 서버에서 백엔드 서버로 보내는 모든 요청에 대해 cookie가 함께 전송되도록 한다.

#### 쿠키 공유 문제

단순히

```js
const cookie = req ? req.headers.cookie : "";
axios.defaults.headers.Cookie = cookie;
```

이런 식으로만 작성하면 `getServerSideProps`를 안 쓰는 페이지가 있을 때 그 페이지에 접속하면 쿠키가 초기화되지 않아서 이전 로그인된 사용자 정보가 유지되는 문제가 발생 + Cookie가 빈 값일때도 axios가 빈 값은 무시해버려서 문제가 발생함<br>
따라서 매번 `axios.defaults`에 설정된 쿠키를 지우고, 요청 및 쿠키가 존재할 때만 다시 설정을 해준다.

---

## getStaticProps 사용해보기

- `getServerSideProps` : 모든 요청에 대해 런타임에 실행됨, 일반적으로 자주 변경되거나 사용자 데이터를 기반으로 개인화된 콘텐츠에 사용
- `getStaticProps` : 빌드할 때 미리 html 파일을 만들어 유저가 그 페이지에 방문할 때마다 html 파일을 제공, 블로그나 뉴스 페이지 같이 일반적으로 자주 변경되지 않는 콘텐츠에 사용

```js
// front/pages/about.js
const Profile = () => {
  const { userInfo } = useSelector((state) => state.user);

  return (
    <AppLayout>
      <Head>
        <title>사용자 정보 | NodeBird</title>
      </Head>
      {userInfo ? (
        <Card
          actions={[
            <div key="twit">
              짹짹
              <br />
              {userInfo.Posts}
            </div>,
            <div key="following">
              팔로잉
              <br />
              {userInfo.Followings}
            </div>,
            <div key="follower">
              팔로워
              <br />
              {userInfo.Followers}
            </div>,
          ]}
        >
          <Card.Meta
            avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
            title={userInfo.nickname}
            description="노드버드 초심자"
          />
        </Card>
      ) : null}
    </AppLayout>
  );
};

export const getStaticProps = wrapper.getStaticProps((store) => async () => {
  store.dispatch({ type: LOAD_USER_REQUEST, data: 1 });
  store.dispatch(END);
  await store.sagaTask.toPromise();
});

export default Profile;
```

> `getStaticProps`의 경우 사용할 수 있는 경우가 한정적임 -> 특정 조건에 따라 보여지는 부분이 달라지거나, 게시글의 댓글이나 좋아요처럼 실시간으로 반영되야 할 부분이 있는 경우 `getServerSideProps`를 적용해야 한다.

```js
// back/routes/user.js
router.get("/:userId", async (req, res, next) => {
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: Number(req.params.userId) },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: Post,
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"],
        },
      ],
    });
    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON();
      data.Posts = data.Posts.length;
      data.Followings = data.Followings.length;
      data.Followers = data.Followers.length;
      res.status(200).json(data);
    } else {
      res.status(404).json("존재하지 않는 사용자입니다.");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});
```

다른 사용자 정보를 조회할 때 팔로잉/팔로워 및 게시글 ID를 공개하는 것은 개인정보 침해의 우려가 있기 때문에 서버단에서 ID 정보를 감추고 대신 length 정보를 넘겨준다.

---

## 다이나믹 라우팅

게시글을 공유하려면 각 게시글에 대한 주소가 필요하다.<br>
`front/pages` 폴더 내에 `post` 폴더를 만들어 그 안에 `[id].js`처럼 대괄호 형식으로 파일을 작성하면 `post/1`, `post/2`처럼 동적으로 게시글의 주소를 처리할 수 있도록 해준다.

```js
// front/pages/post/[id].js
const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  const { singlePost } = useSelector((state) => state.post);
  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}
          님의 게시글
        </title>
        <meta name="description" content={singlePost.content} />
        <meta
          property="og:title"
          content={`${singlePost.User.nickname}님의 게시글`}
        />
        <meta property="og:description" content={singlePost.content} />
        <meta
          property="og:image"
          content={
            singlePost.Images[0]
              ? singlePost.Images[0].src
              : "https://nodebird.com/favicon.ico"
          }
        />
        <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, params }) => {
      const cookie = req ? req.headers.cookie : "";
      axios.defaults.headers.Cookie = "";
      if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
      }
      store.dispatch({ type: LOAD_MY_INFO_REQUEST });
      store.dispatch({ type: LOAD_POST_REQUEST, data: params.id });
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
);

export default Post;
```

`useRouter` Hook을 통해 라우터 객체를 만들면, `http://localhost:3000/post/[id]`로 접근했을 때 **[id]** 부분을 `router.query.id`로 얻어낼 수 있다. `getServerSideProps`에서는 `params.id`를 통해 얻어낸다.

![image](https://github.com/ZeroCho/react-nodebird/assets/85874042/918890a2-72f5-4efb-8e5f-3897fec747a4)

`Head` 안에 있는 부분은 알아서 서버 사이드 렌더링이 되기 때문에 검색엔진이 읽을 수 있게 된다. `og:`에는 공유를 했을 때 보여지는 부분을 설정할 수 있다.

---

## CSS 서버 사이드 렌더링

`styled-components`로 만든 CSS가 서버 사이드 렌더링 시에도 적용이 되도록 하려면 두 가지 설정이 필요하다.

### `.babelrc`

next가 기본적으로 정해주는 babel 설정을 `.babelrc` 파일을 통해 customize할 수 있다.

설치 : `npm i babel-plugin-styled-components`

```json
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "babel-plugin-styled-components",
      {
        "ssr": true,
        "displayName": true
      }
    ]
  ]
}
```
`displayName`을 `true`로 설정하면 `styled-components`에 의해 랜덤한 문자열로 해시화된 클래스명을 알아보기 쉽도록 바꿔준다.

### `_document.js`

모든 페이지들의 공통 페이지인 `_app.js`의 상위에서 동작되며,
`styled-components`를 서버 사이드 렌더링하기 위한 코드를 여기서 작성한다.

```js
// front/pages/_document.js
import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });
      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } catch (error) {
      console.error(error);
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```

chrome에서 disable javascript한 이후에도 css가 정상적으로 로드가 된다면 css 서버사이드렌더링이 성공적으로 된 것이다.

---

## 유저 게시글, 해시태그 게시글

### 유저 게시글

특정 유저를 클릭하면 그 사람이 작성한 게시글들을 보여줌

```js
// front/pages/user/[id].js
const User = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } =
    useSelector((state) => state.post);
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_USER_POSTS_REQUEST,
            lastId,
            data: id,
          });
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMorePosts, loadPostsLoading]);
  return (
    <>
      <Head>
        <title>{userInfo.nickname}님의 글</title>
      </Head>
      <AppLayout>
        <Card
          actions={[
            <div key="twit">
              짹짹
              <br />
              {userInfo.Posts}
            </div>,
            <div key="followings">
              팔로잉
              <br />
              {userInfo.Followings}
            </div>,
            <div key="followers">
              팔로워
              <br />
              {userInfo.Followers}
            </div>,
          ]}
        >
          <Card.Meta
            avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
            title={userInfo.nickname}
          />
        </Card>
        {mainPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, params }) => {
      const cookie = req ? req.headers.cookie : "";
      axios.defaults.headers.Cookie = "";
      if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
      }
      store.dispatch({ type: LOAD_MY_INFO_REQUEST });
      store.dispatch({ type: LOAD_USER_REQUEST, data: params.id });
      store.dispatch({ type: LOAD_USER_POSTS_REQUEST, data: params.id });
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
);
export default User;
```

* `LOAD_MY_INFO_REQUEST`: state에 내 정보(`me`) 저장 -> `AppLayout`과 `UserProfile` 컴포넌트에서 사용<br>
* `LOAD_USER_REQUEST`: state에 유저 정보(`userInfo`) 저장 -> `User` 컴포넌트에서 사용<br>
* `LOAD_USER_POSTS_REQUEST`: state에 유저가 작성한 게시글(`mainPosts`) 저장 -> `User`와 `PostCard` 컴포넌트에서 사용


### 해시태그 게시글

해시태그를 클릭하면 그 해시태그가 포함된 게시글들을 보여줌

```js
// front/pages/hashtag/[tag].js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { END } from "redux-saga";
import axios from "axios";
import wrapper from "../../store/configureStore";

import AppLayout from "../../components/AppLayout";
import PostCard from "../../components/PostCard";
import { LOAD_HASHTAG_POSTS_REQUEST } from "../../reducers/post";
import { LOAD_MY_INFO_REQUEST } from "../../reducers/user";

const Hashtag = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { tag } = router.query;
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } =
    useSelector((state) => state.post);

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_HASHTAG_POSTS_REQUEST,
            lastId,
            data: tag,
          });
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMorePosts, loadPostsLoading]);
  return (
    <AppLayout>
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, params }) => {
      const cookie = req ? req.headers.cookie : "";
      axios.defaults.headers.Cookie = "";
      if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
      }
      store.dispatch({ type: LOAD_MY_INFO_REQUEST });
      store.dispatch({ type: LOAD_HASHTAG_POSTS_REQUEST, data: params.tag });
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
);
export default Hashtag;
```

* `LOAD_HASHTAG_POSTS_REQUEST`: state에 해시태그에 해당되는 글(`mainPosts`) 저장 -> `Hashtag`와 `PostCard` 컴포넌트에서 사용

### state 재사용

`LOAD_USER_POSTS_xxx`, `LOAD_HASHTAG_POSTS_xxx`, `LOAD_POSTS_xxx`는 조건만 다를 뿐 모두 포스트를 로드한다는 점은 동일하다. 같은 페이지에서 위 세 가지 중 두 가지 액션 이상이 dispatch되는 경우가 아니라면 state를 재사용함으로써 코드를 간소화할 수 있다.

```js
// front/reducers/post.js
case LOAD_USER_POSTS_REQUEST:
case LOAD_HASHTAG_POSTS_REQUEST:
case LOAD_POSTS_REQUEST:
  draft.loadPostsLoading = true;
  draft.loadPostsDone = false;
  draft.loadPostsError = null;
  break;
case LOAD_USER_POSTS_SUCCESS:
case LOAD_HASHTAG_POSTS_SUCCESS:
case LOAD_POSTS_SUCCESS:
  draft.loadPostsLoading = false;
  draft.loadPostsDone = true;
  draft.mainPosts = draft.mainPosts.concat(action.data);
  draft.hasMorePosts = action.data.length === 10;
  break;
case LOAD_USER_POSTS_FAILURE:
case LOAD_HASHTAG_POSTS_FAILURE:
case LOAD_POSTS_FAILURE:
  draft.loadPostsLoading = false;
  draft.loadPostsError = action.error;
  break;
```

---

## getStaticPaths

정적 페이지에서의 **dynamic routing**을 구현하기 위해서 `getStaticProps`와 같이 사용되는 함수이다.

```js
export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: "1" } },
      { params: { id: "2" } },
    ],
    fallback: false,
  };
}
```

* **paths**: 어떤 페이지들을 빌드 타임에 생성할지 설정<br>
위처럼 작성 시 빌드 타임에 `post/1`, `post/2` 페이지가 정적으로 생성된다.

* **fallback**<br>
`false`: 미리 만들어주지 않은 페이지에 접근 시 404<br>
`true`: 미리 만들어주지 않은 페이지에 접근 시 `getStaticProps` 내의 코드 실행

```js
const router = useRouter();
if (router.isFallback) {
  return <div>로딩중...</div>;
}
```

> `getStaticProps` 내의 코드 실행 중일 때는 `isFallback`가 `true`가 되어 return문이 실행되고, 코드 실행이 끝나 데이터를 정상적으로 가져오면 `isFallback`이 `false`가 되어 완전한 페이지를 보여준다.

> 왜인지 모르겠지만 미리 만들어주지 않은 페이지에 접근 시에 `singlePost` 값이 제대로 반영이 안되는 것 같다...

---

## SWR 사용해보기

**데이터 가져오기(data fetching)를 위한 라이브러리**<br>

### 설치

**front** ->  `npm i swr`

### 사용

`const { data, error } = useSWR(key, fetcher)`

* `key`: 요청을 보낼 주소
* `fetcher`: `key`를 받아 데이터를 반환하는 비동기 함수(Axios, GraphOL와 같은 라이브러리 사용 가능)
* `data`: `useSWR`에 의해 반환된 데이터
* `error`: 데이터를 가져오는 과정에서 오류가 발생할 시 반환

```js
// front/pages/profile.js
const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((result) => result.data);

const profile = () => {
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);
  const { data: followersData, error: followerError } = useSWR(
    `http://localhost:3065/user/followers?limit=${followersLimit}`,
    fetcher
  );
  const { data: followingsData, error: followingError } = useSWR(
    `http://localhost:3065/user/followings?limit=${followingsLimit}`,
    fetcher
  );
  const { me } = useSelector((state) => state.user);

  useEffect(() => {
    if (!(me && me.id)) {
      Router.replace("/");
    }
  }, [me && me.id]);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return <div>팔로잉/팔로워 로딩 중 에러가 발생하였습니다.</div>;
  }

  if (!me) {
    return <div>내 정보 로딩중...</div>;
  }

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList
          header="팔로잉 목록"
          data={followingsData}
          onClickMore={loadMoreFollowings}
          loading={!(followingsData || followingError)}
        />
        <FollowList
          header="팔로워 목록"
          data={followersData}
          onClickMore={loadMoreFollowers}
          loading={!(followersData || followerError)}
        />
      </AppLayout>
    </>
  );
};
``` 

1. 기본적으로 보여지는 팔로워/팔로잉 수를 3으로 설정
2. 더보기 버튼 클릭 시 `loadMoreFollowings`/`loadMoreFollowers`가 실행되면서 `followersLimit`/`followingsLimit`이 3씩 증가됨
3. limit이 변경됨 -> `useSWR`의 key 값이 변경되어 fetcher 함수 실행
4. fetcher 함수 실행 중에는 data와 error 둘다 비어 있는 경우 loading이 `true`가 됨
5. fetcher 함수의 실행이 끝나 data에 값이 채워질 때 loading이 `false`가 되어 화면에 데이터가 채워짐

기본적으로 CSR로 동작하지만, `useSWR`의 세 번째 옵션으로 initialData를 주게 되면 SSR로 동작이 된다.

```js
export async function getServerSideProps() {
  const data = await fetcher("/api/data");
  return { props: { data } }
}

function App(props) {
  const initialData = props.data;
  const { data } = useSWR("/api/data", fetcher, { initialData });
}
```

`getServerSideProps`에서 서버로부터 받은 데이터를 props에 담아 return -> 컴포넌트에 props가 전달되어 그 안의 data를 꺼낼 수 있음

> `useEffect`과 같은 Hook의 경우 return문보다는 상위에 위치해야 한다. return문에 의해 Hook이 실행되지 않는 경우가 없어야 한다.

---

## moment와 next 빌드하기

### `moment.js`

날짜 라이브러리의 대표주자, 최근에는 불변성과 용량 문제를 이유로 `date-fns`나 `dayjs`를 대안으로 사용하는 추세이다.
> `moment.js` 대신 `dayjs` : https://luke-tofu.tistory.com/entry/Goodbye-Moment-feat-Dayjs

#### 설치

**front** -> `npm i moment`

#### 사용

`moment.locale("ko")`: 날짜를 포맷했을 때 한글로 표시

```html
<!-- 작성일자를 YYYY.MM.DD 형식으로 포맷 -->
<div style={{ float: "right" }}>
  {moment(post.createdAt).format("YYYY.MM.DD")}
</div>
```

### next 빌드하기

* 빌드: `redux-devtools`, `hot reload`, `code spliting` 등 next가 즉석에서 하는 것들을 미리 준비를 해두는 과정 -> 빌드 후 나오는 html/css/js 파일을 실제로 배포함<br>
개발에 필요한 것들을 빼버리고 실제 필요한 것들만 남겨둔다.

┌ `npm run bulid`<br>
![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/391f5e54-9fbe-48f4-b291-aaae544f4208)

각 페이지별로 1MB를 넘지 않으면 실제로 서비스하는 데 문제가 없음
(1MB가 넘어가면 `React.lazy`나 `Suspense`로 코드를 분할하는 것이 좋다.)

> [**production**]404 및 500 페이지 커스터마이징 참고: https://nextjs.org/docs/pages/building-your-application/routing/custom-error -> 에러 메시지를 노출하지 않도록 설정

---

## 커스텀 웹팩과 bundle-analyzer

### 설치

`npm i @next/bundle-analyzer cross-env`

### 커스텀 웹팩 및 bundle-analyzer 설정

next가 정해 놓은 기본 웹팩 설정(`config`)을 바꾸는 방식으로 커스터마이징한다. (**불변성**을 지켜야 함 -> immer 사용 가능)

```js
// front/next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  compress: true,
  webpack(config, { webpack }) {
    const prod = process.env.NODE_ENV === "production";
    const plugins = [...config.plugins];
    return {
      ...config,
      mode: prod ? "production" : "development",
      devtool: prod ? "hidden-source-map" : "eval",
      plugins,
    };
  },
});
```
`module.exports`를 `withBundleAnalyzer`로 감싸준다.

* `compress: true` -> html/css/js 파일을 `gzip`으로 압축하여 용량을 줄임, 압축된 파일은 브라우저가 알아서 해제한다.

### bundle-analyzer

`npm run build`를 통해 빌드된 페이지 및 번들링된 모듈의 전반적인 크기를 파악할 수 있음<br>

이 때 `bundle-analyzer`를 이용하면 번들에서 어떤 요소가 얼마나 용량을 차지하는지를 알 수 있다.

#### process.ENV 설정(`cross-env`)

`.env` 대신 `package.json` 내에서 직접 `process.ENV`를 설정할 수 있다.

```json
// front/package.json
{
  "scripts": {
    "dev": "next",
    "start": "next start",
    "build": "cross-env ANALYZE=true NODE_ENV=production next build"
  },
}
```
이러한 방식은 기본적으로 맥과 리눅스에만 적용되기 때문에 `cross-env`를 통해 윈도우에도 작동되도록 할 수 있다.

#### 실행

1. **서버** -> 서버 측은 용량이 커도 크게 문제되지 않는다.

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/16a03f1c-6b72-4730-a232-367932ab4e34)

2. **클라이언트** -> 사용자와 직결되는 부분이기 때문에 클라이언트 측 용량이 커지는 것은 문제가 됨

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/92859253-0383-48bd-8d22-bbb46ec45360)

`concatenated`의 경우 이미 합쳐져 있는 것이기 때문에 없애기 힘들고, 대신 `moment`의 `locale`에서 한국어팩(`ko.js`)를 제외한 나머지 언어팩을 없애는 것은 가능하다.<br>
-> 이러한 과정을 **tree shaking**이라고 하며, 프로그램 실행에 영향을 주지 않는 코드를 빌드 단계에서 제거함으로써 번들 파일 크기를 최적화할 수 있다.

> 해결방법: plugin에 `new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /^\.\/ko$/)` 추가

+ 게시글 수정하기, 신고하기 부분 스스로 해보기
