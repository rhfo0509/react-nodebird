# Redux 연동하기

## Redux 설치와 필요성 소개

### `next-redux-wrapper`

next에 redux를 붙이는 과정이 꽤나 복잡한 데, 이를 간편하게 하도록 도와주는 라이브러리이다.

- `npm i redux next-redux-wrapper` 로 패키지 설치

- `store/configureStore.js` 작성

```js
import { createWrapper } from "next-redux-wrapper";
import { createStore } from "redux";

const configureStore = () => {
  const store = createStore(reducer);
  return store;
};

const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === "development",
});

export default wrapper;
```

- `_app.js`에서 `wrapper.withRedux(App)`을 통해 NextJS와 Redux를 연동하여 모든 컴포넌트에서 Redux를 이용가능하도록 함

```js
// _app.js
export default wrapper.withRedux(App);
```

> 이전 버전 `next-redux-wrapper`의 경우 페이지를 `<Provider store={store}>...</Provider>`로 감싸야 했지만, 6버전으로 들어서면서 알아서 `<Provider>`로 감싸주기 때문에 한번 더 감싸는 경우 문제가 발생하게 된다.

### Redux의 필요성

여러 컴포넌트에서 공통으로 쓰이는 데이터의 경우, 기존 React의 경우 데이터가 컴포넌트별로 따로 저장되어있기 때문에 수동으로 부모 컴포넌트를 만들고 부모 컴포넌트를 통해 자식 컴포넌트로 데이터를 보내는 과정이 필요하다.<br>

이에 비해 Redux의 경우 중앙에서 하나로 관리해서 컴포넌트에 뿌려주는 <b>중앙 데이터 저장소</b>가 존재해서 데이터 관리가 더 용이해진다.<br>

컴포넌트별로 데이터를 따로 들고 있는 경우 컴포넌트마다 데이터가 다르게 렌더링되는 문제도 발생하기 때문에 규모가 큰 서비스라면 무조건 중앙 데이터 저장소 하나 정도는 필요로 하게 된다.<br>

### Redux vs MobX vs Context API

- MobX

코드량이 적은 대신 실수 발생 시 에러 추적이 쉽지 않다는 단점이 있기 때문에 어느 정도 리액트 생태계를 이해하고 리액트를 자유자재로 다룰 수 있는 숙련자에게 좋다.

- Redux

에러가 나면 에러 추적이 쉽기 때문에 리액트 초보자에게 좋음, 그러나 코드량이 많아 생산성 측면에서는 마이너스다.
중앙 데이터 저장소가 너무 커지는 경우 여러 개로 쪼갤 수도 있다는 장점이 있다.

- Context API

만들고자 하는 서비스가 별로 크지 않은 경우 사용<br>
중앙 데이터 저장소에서 데이터를 요청하고 받아오는 방식이 비동기로 이루어지는데, 데이터 요청/성공/실패 시의 로직을 **컴포넌트 내**에서 작성한다는 점은 단점이다.

---

## 리덕스의 원리와 불변성

### 리덕스의 원리

![image](https://user-images.githubusercontent.com/85874042/231397626-0acb7c6c-0386-4cc0-b3a3-092b43111942.png)

1. App에 대한 전체 상태를 하나의 객체로 표현해두고
   그것을 바꾸고 싶을때마다 `action`을 하나씩 만든다.
2. `action`이 `dispatch`될 때의 로직을 `reducer`를 통해 직접 구현한다.
3. `dispatch`를 하게 되면 `reducer`에 적어준 방식에 따라 저장소 내의 `state`가 바뀐다.

- 단점

데이터를 하나씩 바꾸고 싶을 때마다 `action` 및 `reducer`를 하나씩 만들어줘야 됨 -> 코드량 증가

- 장점

`action` 하나하나가 redux에 기록이 됨(history) -> 지금까지 데이터를 어떻게 바꿔왔는지 내역을 추적 가능 (bug 잡기 편함) <br>
데이터를 뒤로 돌렸다가 다시 되돌리는 것도 가능 (테스트하기 편함)

### 리덕스의 불변성

" <b>Immutability</b> "

```js
console.log({} === {}); // false
const a = {};
const b = a;
console.log(a === b); // true
```

객체를 새로 만든 것은 항상 **false**인데, 두 객체 간에 참조 관계가 있으면 **true**라는 점을 활용한다.

그렇다면 위 그림에서
`return { ...state, name: action.data }`
부분은 name 부분만 바꾸고 나머지 부분은 그대로 하되, **객체 자체를 새로 만들어 return** 하는 1번째 경우에 해당된다.

- 왜 객체를 새로 만들어 return해야 할까?
  > 변경 내용을 추적할 수 있기 때문이다.

```js
const prev = { name: "zerocho" };

const next = { name: "boogicho" };
```

이런 식으로 새로운 객체를 만들어야 이전 기록과 바뀐 기록, 두 기록이 저장되는 것이다.

```js
const prev = { name: "zerocho" };

const next = prev;
next.name = "boogicho";
```

이런 식으로 바꿔버리면 `prev.name` 의 값 또한 `boogicho`로 변경되고, 이렇게 되면 이전 기록은 사라져 버린다.

- 그럴거면 아예 전체를 다 적어도 되는 거 아닐까?
  > 코드가 길어질 뿐만 아니라 메모리 낭비도 발생할 수 있다.

```js
{
  name: 'zerocho',
  age: 27,
  password: 'babo',
  posts: [{}, {}, {}]
}
```

이러한 state에서 name만을 바꾸고 싶은 경우,<br>
`{ ...state, name: action.data }`<br>
에서는 이전 posts와 참조 관계를 형성하지만(shallow copy) <br>

`{ name: action.data, age: 27, password: 'babo', posts: [{}, {}, {}] }`<br>
에서는 새로운 posts 배열(내부 객체 포함)이 새로 생성이 되고, action이 한 번 실행할 때마다 이 새롭게 만들어진 posts도 기록이 되기 때문에 메모리를 많이 잡아먹게 된다.<br>
posts의 경우 바뀌지 않기 때문에 참조 관계를 유지해도 괜찮다. 따라서 이 때는 첫 번째와 같이 작성하는 것이 좋다.

---

## 리덕스 실제 구현하기

- **store**: state와 reducer를 포함, state를 관리하는 전용 장소

- **reducer**: 이전 state와 action을 통해서 다음 state를 만들어내는 함수

```js
// reducers/index.js
const initialState = {
  name: "zerocho",
  age: 27,
  password: "babo",
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHANGE_NICKNAME":
      return {
        ...state,
        name: action.name,
      };
    default:
      return state;
  }
};

export default rootReducer;
```

store에서 `dispatch(action)`을 통해 store의 reducer에 action을 전달할 수 있게 된다.

```js
// store/condigureStore.js
...
const configureStore = () => {
 const store = createStore(reducer);
 store.dispatch({
   type: 'CHANGE_NICKNAME',
   data: 'gildong',
 })
 return store;
};
...
```

### 액션 생성기

```js
const changeNickname = {
  type: "CHANGE_NICKNAME",
  data: "gildong",
};
const changeNickname = {
  type: "CHANGE_NICKNAME",
  data: "nerocho",
};
const changeNickname = {
  type: "CHANGE_NICKNAME",
  data: "herocho",
};
```

이렇게 같은 타입의 액션인데 데이터만 달라지는 경우 매번 액션 객체를 생성해야 하는 불편함이 있다.

**액션 생성기**를 통해 동적으로 액션을 생성해주는 함수를 만들면 이러한 단점을 해결할 수 있다.

```js
const changeNickname = (data) => {
  return {
    type: "CHANGE_NICKNAME",
    data,
  };
};
```

`store.dispatch(changeNickname('gildong'))` -> 이런 식으로 동적으로 데이터를 넣어줄 수 있다.

### 컴포넌트에 적용

`npm i react-redux` 패키지 설치

- useState 대신 **useSelector**를 사용한다.

```js
import { useSelector } from "react-redux";

const [isLoggedIn, setIsLoggedIn] = useState(false); // X

const isLoggedIn = useSelector((state) => state.user.isLoggedIn); // O
```

- 이제 `setIsLoggedIn` 대신 **`store.dispatch(action)`** 으로 상태값을 변경하기 때문에 `setIsLoggedIn` 부분은 제거한다.

- `store.dispatch(action)` 부분은 **`useDispatch`** 를 통해서도 같은 기능을 수행할 수 있다.

```js
import { useDispatch } from "react-redux";

const dispatch = useDispatch();
dispatch(loginAction({ id, password }));
```

---

## 미들웨어와 리덕스 데브툴즈

### 리덕스 데브툴즈란?

리덕스 애플리케이션을 개발하면서 상태(state) 변화를 모니터링하고 디버깅할 수 있는 크롬 확장프로그램이다.
크롬 웹 스토어에서 `Redux DevTools`를 검색하여 확장 프로그램을 설치할 수 있다.

### 리덕스 데브툴즈에 액션을 기록하고 싶다면?

> 리덕스 store에 **enhancer**를 추가하여 기능을 덧붙힌다.

1. `npm i redux-devtools-extension`
2. 리액트 앱에서 store 생성 시 `composeWithDevTools`(개발용)/`compose`(배포용) 메서드를 사용하여 **middleware**를 적용시킨 **enhancer**를 추가

```js
...
const middlewares = []; // saga나 thunk가 들어갈 자리
const enhancer =
  process.env.NODE_ENV === "production"
    ? compose(applyMiddleware(...middlewares))
    : composeWithDevTools(applyMiddleware(...middlewares));
const store = createStore(reducer, enhancer);
...
```

### 적용 후
![image](https://user-images.githubusercontent.com/85874042/231661587-93c184e9-8537-41d4-bfb9-0e89270383e4.png)

> 지금까지 어떤 액션들이 dispatch 되었는지, 그리고 액션에 따라 상태가 어떻게 변화했는지 확인 할 수 있고, 특정 시점으로 jump할 수 있는 기능도 제공한다.
---

## 리듀서 쪼개기

action들이 많아짐에 따라 case도 점차 늘어나게 될 것인데, `reducer`를 여러 개로 쪼갬으로써 코드의 재사용성 및 유지보수성을 높일 수 있다.

```js
const initialState = {
  user: {
    isLoggedIn: false,
    user: null,
    signUpData: [],
    loginData: [],
  },
  post: {
    mainPosts: [],
  },
};
```
initialState 내에서 **user**와 **post**로 구분되어있기 때문에 reducer 또한 두 개로 쪼갤 수 있다.

```js
// reducers/user.js
export const initialState = {
  isLoggedIn: false,
  user: null,
  signUpData: [],
  loginData: [],
};

export const loginAction = (data) => {
  return {
    type: "LOG_IN",
    data,
  };
};

export const logoutAction = () => {
  return {
    type: "LOG_OUT",
  };
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOG_IN":
      return {
        ...state,
        isLoggedIn: true,
        user: action.data,
      };
    case "LOG_OUT":
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };
    default:
      return state;
  }
};

export default reducer;
```

```js
// reducers/post.js
export const initialState = {
  mainPosts: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
```

기존 `reducers/index.js`에서 작성했던 내용을 `user`와 관련된 부분, `post`와 관련된 부분으로 분리하여 따로 작성한다. (이 때 **deps**가 한 단계 낮아졌기 때문에 이를 고려해서 분리하도록 한다.)

### `combineReducers`

reducer는 함수인데, 함수끼리 합치는 것은 힘들기 때문에 `combineReducers`의 도움을 받아야 한다.

```js
// reducers/index.js
import { HYDRATE } from "next-redux-wrapper";

import user from "./user";
import post from "./post";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  index: (state = {}, action) => {
    switch (action.type) {
      case HYDRATE:
        console.log("HYDRATE", action);
        return { ...state, ...action.payload };

      default:
        return state;
    }
  },
  user,
  post,
});

export default rootReducer;
```

redux의 서버 사이드 렌더링을 위해 `HYDRATE`가 필요한데, 이것을 넣어주기 위해 `index` reducer를 추가해주고, 나머지 분리한 두 reducer(`user`, `post`)도 넣어 이들을 하나의 리듀서로 합쳐서 사용할 수 있도록 한다.

---

## 더미데이터와 포스트폼 만들기

* **속성**의 경우, 서버 개발자로부터 어떤 형식으로 받을 건지 사전에 협의를 하는 것이 좋다.
* `mainPosts`의 경우 -> 일반적으로 게시글 자체의 속성인 `id`와 `content`는 **소문자**로, 다른 정보들을 이용하는 `User`, `Images`, `Comments`는 **대문자**로 작성한다.

```js
// reducers/post.js
export const initialState = {
  mainPosts: [
    {
      id: 1,
      User: {
        id: 1,
        nickname: "zero",
      },
      content: "첫 번째 게시글 #해시태그 #익스프레스",
      Images: [
        {
          src: "https://bookthumb-phinf.pstatic.net/cover/137/995/13799585.jpg?udate=20180726",
        },

        {
          src: "http://gimg.gilbut.co.kr/book/BN001958/rn_view_BN001958.jpg",
        },

        {
          src: "https://gimg.gilbut.co.kr/book/BN001998/rn_view_BN001998.jpg",
        },
      ],
      Comments: [
        {
          User: { nickname: "nero" },
          content: "우와 개정판이 나왔군요~",
        },
        {
          User: { nickname: "hero" },
          content: "얼른 사고 싶어요!",
        },
      ],
    },
  ],
  imagePath: [],    // 이미지 업로드 시 이미지 경로 저장
  postAdded: false, // 게시글 추가가 완료되었을 때 true
};

const dummyPost = {
  id: 2,
  User: {
    id: 1,
    nickname: "zero",
  },
  content: "더미데이터입니다.",
  Images: [],
  Comments: [],
};

const ADD_POST = "ADD_POST";
export const addPost = {
  type: ADD_POST,
  data: dummyPost,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST:
      return {
        ...state,
        mainPosts: [dummyPost, ...state.mainPosts],
        postAdded: true,
      }
    default:
      return state;
  }
};

export default reducer;
```

* 액션 이름을 **상수**로 빼줄 경우, 다른 곳에서 재사용하기 편하며 오타를 낼 확률도 줄어든다.
* `mainPosts: [dummyPost, ...state.mainPosts]` 처럼 앞에다 추가해야 게시글 최상단으로 올라간다.

### 메인화면에 포스트 넣기

```js
const Home = () => {
  return (
    <AppLayout>
      <PostForm />
      <PostCard />
    </AppLayout>
  )
}
```

**의미가 있는 단위**로 컴포넌트를 나눈다. -> 게시글 작성하는 부분(`PostForm`) / 게시글 보여주는 부분(`PostCard`)

```js
// pages/index.js
...
const Home = () => {
  const { isLoggedIn } = useSelector((state) => state.user);
  const mainPosts = useSelector((state) => state.post.mainPosts);
  return (
    <AppLayout>
      {isLoggedIn && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
  );
};
```

* 로그인 여부에 따라 게시글 작성 폼을 보이거나, 또는 안보이도록 해야 하고, 메인페이지에 전체 게시글이 보이게 하기 위해 `useSelector`를 통해 `isLoggedIn`과 `mainPosts` state를 가져온다.
* 반복문의 **key**는 컴포넌트의 순서가 바뀔 가능성이 있는 경우, 웬만해선 **index**을 넣지 않도록 한다.

### 이미지 업로드 버튼 클릭 시 파일 업로드창이 나오도록 하려면

1. `const imageInput = useRef()`
2. `<input type="file" multiple hidden ref={imageInput} />` -> input에 ref를 달아준다.
3. `imageInput.current.click()`을 통해 input 클릭하면 파일 업로드창을 띄울 수 있음

---

## 게시글 구현하기

의미있는 단위로 컴포넌트를 나눈 후 개별 단위로 설계한다.
```js
// components/PostCard.js
const PostCard = ({ post }) => {
  return (
    <div>
      <Card>
        <Image />
        <Content />
        <Buttons></Buttons>
      </Card>
      <CommentForm />
      <Comments />
    </div>
  )
};
```

`Card` 컴포넌트의 속성을 이용해 `Image`, `Content`, `Buttons` 컴포넌트를 구현해보자.

1. `Image`:`Card`의 **cover** 속성 이용
2. `Content`: `Card.Meta`를 통해 구현
3. `Buttons`: `Card`의 **actions** 속성 이용

```js
// components/PostCard.js
const PostCard = ({ post }) => {
  const id = useSelector((state) => state.user.me?.id);
  return (
    <div>
      <Card
        cover={post.Images[0] && <PostImages images={post.Images} />}
        actions={[
          <RetweetOutlined key="retweet" />,
          <HeartOutlined key="heart" />,
          <MessageOutlined key="message" />,
          <Popover
            key="more"
            content={
              <Button.Group>
                {id && id === post.User.id ? (
                  <>
                    <Button>수정</Button>
                    <Button type="danger">삭제</Button>
                  </>
                ) : (
                  <Button>신고</Button>
                )}
              </Button.Group>
            }
          >
            <EllipsisOutlined />
          </Popover>,
        ]}
      >
        <Card.Meta 
          avatar={<Avatar>{post.User.nickname[0]}</Avatar>}
          title={post.User.nickname}
          description={post.User.content}
        />
      </Card>
      {/* <CommentForm />
      <Comments /> */}
    </div>
  );
};
```

* 이미지가 존재하는 경우에만 `PostImages` 컴포넌트를 통해 이미지를 보여준다.
* 현재 로그인 중이고, 내 아이디와 게시글 작성자 아이디와 같을 때는 **수정 / 삭제** 버튼을, 그 외에는 **신고** 버튼을 보여준다.

### `PropTypes.shape()`
post 내의 속성들도 타입 체크를 하기 위해 사용

```js
PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    Images: PropTypes.arrayOf(PropTypes.object),
    Comments: PropTypes.arrayOf(PropTypes.object),
    createdAt: PropTypes.object,
  }).isRequired,
};
```
> 의문점: `createdAt` 같은 경우 자동으로 생성되는 속성인지?

---

## 댓글 구현하기

```js
{commentFormOpened && (
  <div>
    <CommentForm />
    <List />
  </div>
)}
```

