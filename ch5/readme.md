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

> **`combineReducers`**는 `(...reducers) => (state, action) => state`의 고차 함수이므로 **`combineReducer`**는 `(state, action) => state` 꼴로 반환된다.<br>
> 따라서 `combineReducer(state, action)`로 호출하면 완성된 **state**가 나오게 된다.

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

**`END`**: `take`에 의해 대기중인 saga들을 모두 종료시킴 -> 단, 하위 task가 아직 실행중인 경우에는 종료될 때까지 기다린 후 task을 종료한다.

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

프론트 서버에서 브라우저로부터 전달받은 `req` 객체 내의 cookie를 `axios.defaults.headers.Cookie`에 추가함으로써 프론트 서버에서 백엔드 서버로 보내는 모든 요청에 대해 cookie가 함께 전송되도록 한다.

#### 쿠키 공유 문제(질문하기)

단순히

```js
const cookie = req ? req.headers.cookie : "";
axios.defaults.headers.Cookie = cookie;
```

이런 식으로만 작성해도 괜찮은거 아닌가요?
예를 들어 A의 cookie값이 axios.defaults에 저장되어 있는 상태에서 B가 인덱스 페이지에 접근하는 경우 req.headers.cookie 값이 달라지니까 결국 axios.defaults에 저장되는 cookie값이 달라지니 문제가 없다고 생각되는데요..

제가 기억하기론 어떤 페이지 중 getServerSideProps를 안 쓰는 페이지가 있을 때 그 페이지에 접속하면 쿠키가 초기화되지 않아서 이전 로그인된 사용자 정보가 유지되었던 문제가 있었고 Cookie가 빈 값일때도 axios가 빈 값은 무시해버려서 문제였었습니다.

if문이 공유를 막는다기보다는 Cookie = ''이 막습니다.

---

## getStaticProps 사용해보기

- `getServerSideProps` : 모든 요청에 대해 런타임에 실행됨, 일반적으로 자주 변경되거나 사용자 데이터를 기반으로 개인화된 콘텐츠에 사용
- `getStaticProps` : 빌드할 때 미리 html 파일을 만들어 유저가 그 페이지에 방문할 때마다 html 파일을 제공, 블로그나 뉴스 페이지 같이 일반적으로 자주 변경되지 않는 콘텐츠에 사용 -> 사용할 수 있는 경우가 한정적임

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
      // GET /user/10000
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
이 때 페이지 경로에 매개변수(parameter)를 추가하여 

`post/:id`