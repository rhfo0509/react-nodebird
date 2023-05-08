# Next.js 서버 사이드 렌더링

## 서버 사이드 렌더링 준비하기

### 기존 CSR 방식의 문제점

* 새로고침 시 데이터가 바로 반영이 되지 않는 이유

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

`Home` 컴포넌트가 처음 렌더링될 때는 유저 정보와 게시글 정보가 들어있지 않은 상태(빈 화면) -> `useEffect`가 실행된 후 백엔드 서버로부터 데이터를 정상적으로 불러온 이후에 데이터가 브라우저에 반영됨

두 과정 사이에 데이터의 공백이 발생하게 되는 문제가 발생한다.

기본적으로 두 번의 요청을 보내는 CSR 방식과는 달리
서버 사이드 렌더링(SSR) 방식은 한 번의 요청으로 백엔드 서버로부터 바로 데이터를 받아올 수 있게 된다.

초기 로딩 속도가 빨라지기 때문에 더 이상 데이터가 비어 보이는 현상이 발생하지 않는다는 장점이 있다.

### 서버 사이드 렌더링을 위한 설정

`next-redux-wrapper`가 제공하는 메서드를 통해 개별 페이지에 SSR을 적용시킬 수 있음

```js
const Home = () => { ... };

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    store.dispatch({ type: LOAD_MY_INFO_REQUEST });
    store.dispatch({ type: LOAD_POSTS_REQUEST });
  }
);
```
Home 컴포넌트 아래에 `getServerSideProps`을 작성하면 Home 컴포넌트가 렌더링되기 이전에 `store.dispatch`가 실행됨 -> 실행된 결과를 `HYDRATE`가 받아서 리덕스 스토어 내 state에 반영함

### rootReducer 구조 변경

![image](https://user-images.githubusercontent.com/85874042/236751524-e09b0821-00f4-45fd-ac8a-251d99f0e4f7.png)

1. index 내에 index, user, post가 들어있음
2. 여전히 유저 및 게시글 데이터가 들어있지 않음

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
![image](https://user-images.githubusercontent.com/85874042/236756722-8de783fc-a05a-41ab-a8b7-42236c2418d7.png)

state, action 인자는 rootReducer = (state, action) => 여기의 state, action을 그대로 combineReducer에 넣는 겁니다.

combineReducers는 (...reducers) => (state, action) => state의 고차 함수이고

combineReducer는 (state, action) => state 함수 꼴입니다.

combineReducer(state, action)로 호출하면 완성된 state가 나오게 됩니다.





