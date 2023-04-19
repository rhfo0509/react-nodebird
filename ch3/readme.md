# Redux-saga 연동하기

## `redux-thunk` 이해하기

### `middleware`
리덕스의 기능을 향상시켜주고, 리덕스에 없던 기능을 추가하는 역할<br>
액션을 디스패치했을 때 리듀서에서 이를 처리하기에 앞서 지정된 작업을 실행할 수 있게 해준다.

#### 기본 구조
```js
const loggerMiddleware = store => next => action => {
  console.log(action);
  return next(action);
}
```
* 액션이 디스패치될 때마다 리듀서에서 처리하기 전에 콘솔에 액션 객체를 로깅해주는 미들웨어이다.<br>
* 액션이 디스패치되면 `store` -> `next` -> `action`에 자동으로 값이 들어가게 된다. <br>
* `next`의 경우 `store.dispatch` 와 비슷한 역할을 하는데, 차이점은 `next(action)`의 경우 다음 처리해야 할 미들웨어에게 액션을 넘겨주고, 만약 그 다음 미들웨어가 없다면 리듀서에게 액션을 넘기게 된다.

### `thunk`
`thunk`란, 특정 작업을 나중에 하도록 미루기 위해서 함수형태로 감싼 것을 말한다.

### `redux-thunk`
리덕스가 비동기 액션을 dispatch할 수 있도록 도와주는 미들웨어

* 기본 형태
```js
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

기본적으로 리덕스의 경우 **액션 객체**를 dispatch하는데,
`redux-thunk` 미들웨어를 사용하게 되면 전달받은 액션이 함수 형태인 경우에는 그 함수에 `dispatch`와 `getState`를 넣어서 실행해준다.<br>

이로 인해 액션이 몇초뒤에 실행되게 하거나, 현재 상태에 따라 아예 액션이 무시될 수 있는 작업이 가능해진다.

### `redux-thunk` 사용해보기

1. `npm i redux-thunk`으로 패키지 설치
2. store 생성 시 미들웨어를 적용한다.
```js
// store/configureStore.js
import thunkMiddleware from "redux-thunk";
...
const configureStore = () => {
  const middlewares = [thunkMiddleware];
  const enhancer =
    process.env.NODE_ENV === "production"
      ? compose(applyMiddleware(...middlewares))
      : composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(reducer, enhancer);
  return store;
};
```
3. 로그인/로그아웃 액션 구성하기

> 로그인과 로그아웃 과정은 바로 진행되는 것이 아니라 실제로는 백엔드로부터 요청을 하고 응답을 받아와야 하는 과정이고, 이는 **비동기**로 이루어지게 된다.

```js
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
```
따라서 이렇게 단순하게 구성되는 것이 아닌
```js
export const loginRequestAction = (data) => {
  return {
    type: "LOG_IN_REQUEST",
    data,
  };
};

export const loginSuccessAction = (data) => {
  return {
    type: "LOG_IN_SUCCESS",
    data,
  };
};

export const loginFailureAction = (data) => {
  return {
    type: "LOG_IN_FAILURE",
    data,
  };
};

export const logoutRequestAction = () => {
  return {
    type: "LOG_OUT_REQUEST",
  };
};

export const logoutSuccessAction = () => {
  return {
    type: "LOG_OUT_SUCCESS",
  };
};

export const logoutFailureAction = () => {
  return {
    type: "LOG_OUT_FAILURE",
  };
};
```

요청을 할 때, 요청에 대한 응답이 성공적으로 올 때, 요청이 실패할 때 <- 이렇게 3가지로 구성이 되어야 한다.

4. `redux-thunk`를 적용한 `action creator` 작성
```js
// reducers/user.js
export const loginAction = (data) => {
  return (dispatch, getState) => {
    console.log(getState());
    dispatch(loginRequestAction(data));
    axios.post('/api/login')
      .then((res) => {
        dispatch(loginSuccessAction(res.data));
      })
      .catch((err) => {
        dispatch(loginFailureAction(err));
      })
  }
}
```

로그인 폼 제출 완료시<br> 
`dispatch(loginAction({ id, password }));`가 호출되고, 이 때 `redux-thunk` 미들웨어에 의해 액션이 함수인 경우 `dispatch`와 `getState`를 인수로 받아 함수가 실행된다. <br>

`loginAction` 한 번에 요청->성공, 요청->실패처럼 dispatch가 여러 번 일어나기 때문에 **비동기 요청**을 처리할 때 주로 사용된다.

이 때 `getState()`의 경우 store 상태를 반환한다.
![image](https://user-images.githubusercontent.com/85874042/232696312-67a0511f-3117-43d3-8ad3-60b1c96feb75.png)

---

## saga 설치하고 generator 이해하기

### saga 설치 및 기본 setting

`npm i redux-saga` 패키지 설치

```js
// store/configureStore.js
import createSagaMiddleware from "redux-saga";
...
const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware, loggerMiddleware];
  const enhancer =
    process.env.NODE_ENV === "production"
      ? compose(applyMiddleware(...middlewares))
      : composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(reducer, enhancer);
  store.sagaTask = sagaMiddleware.run(rootSaga);
  return store;
};
```

`sagas/index.js` 에서 `rootSaga`를 작성하고 이를 import한다.

### generator
중단점이 있는 함수로, `next()`를 호출할 때 함수가 실행되고, **`yield`** 키워드를 만날 때까지 함수의 실행이 지속된다.

![image](https://user-images.githubusercontent.com/85874042/232701823-855c26d9-86ee-4e94-9fd3-9fe9e2f32eb5.png)

> 자바스크립트에서 무한을 표현하고 싶을 때 제너레이터를 사용하는데, 이 성질을 이용해서 **이벤트 리스너**처럼 활용할 수도 있다. -> 무한 반복문으로 인해 함수가 끝나지 않은 상태에서 `next()`를 호출하는 방식이 이벤트 리스너와 유사함

이러한 generator의 성질을 활용한 것이 바로 `saga`라고 할 수 있다.

---

## saga 이펙트 알아보기

> saga 이펙트 앞에는 꼭 `yield` 키워드를 넣어주도록 한다. 그 이유 중 하나는 테스트하기 편하다는 것에 있다.

1. **`all`**

`fork`나 `call`로 실행시킨 제너레이터 함수들을 동시에 실행할 수 있도록 해준다.

2. **`fork`**/**`call`**

제너레이터 함수를 실행한다.
* `fork` : 비동기 실행(*non-blocking*)
* `call` : 동기 실행(*blocking*), 결과를 기다려야 하는 API 요청 같은 곳에 사용됨 -> `await`과 비슷한 역할을 한다.

3. **`take`**

해당 액션이 dispatch될 때까지 기다린다.

4. **`put`**

실제로 액션을 dispatch한다.

### 동작순서

```js
// sagas/index.js
import { all, fork, call, take, put } from "redux-saga/effects";
import axios from "axios";

function logInAPI(data) {
  return axios.post("/api/login", data);
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data);
    yield put({
      type: "LOG_IN_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_IN_FAILURE",
      data: err.respose.data,
    });
  }
}

function logOutAPI() {
  return axios.post("/api/logout");
}

function* logOut() {
  try {
    const result = yield call(logOutAPI);
    yield put({
      type: "LOG_OUT_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_OUT_FAILURE",
      data: err.respose.data,
    });
  }
}

function addPostAPI(data) {
  return axios.post("/api/post", data);
}

function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: "ADD_POST_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "ADD_POST_FAILURE",
      data: err.respose.data,
    });
  }
}

function* watchLogIn() {
  yield take("LOG_IN_REQUEST", logIn);
}

function* watchLogOut() {
  yield take("LOG_OUT_REQUEST", logOut);
}

function* watchAddPost() {
  yield take("ADD_POST_REQUEST", addPost);
}

export default function* rootSaga() {
  yield all([fork(watchLogIn), fork(watchLogOut), fork(watchAddPost)]);
}

```

1. `sagaMiddleware.run(rootSaga)`을 통해 rootSaga 실행
2. `fork`와 `all`에 의해 `watchLogIn()`, `watchLogOut()`, `watchAddPost()`가 병행적으로 실행됨
3. `watchLogIn`에서는 `take`에 의해 `LOG_IN_REQUEST` 액션이 dispatch될 때까지 기다림 (event listener 같은 역할)
4. `LOG_IN_REQUEST` 액션이 dispatch 될때 `logIn` 함수가 실행, 이 때 액션 객체가 `logIn` 함수의 매개변수로 전달됨
5. `logIn`에서 `logInAPI`를 실행하고, `call`에 의해 결괏값을 기다린다.
> `call`이나 `fork`의 경우 호출 방식이 특이하다. `logInAPI(action.data)` -> `call(logInAPI, action.data)` (`call`이나 `fork`를 사용 시)
6. `logInAPI`에서 실제로 API 요청을 보내고 성공 시에는 `LOG_IN_SUCCESS`, 실패 시에는 `LOG_IN_FAILURE` 액션이 dispatch된다.

### thunk와 비교

* `thunk`

한 번에 dispatch를 여러 번 할 수 있게 해준다. 이게 끝. 아래와 같이 saga에서 제공하는 부가 기능 같은 경우 직접 구현을 해야 한다.


* `saga`

설정한 시간 이후에 dispatch되게 하는 `delay` 기능<br>
실수로 클릭을 두 번할 때 가장 마지막 것만 요청을 보내는 `takelatest` 기능<br>
단기간에 엄청난 양이 dispatch되는 것을 막는 `throttle` 기능<br>
등 thunk에 비해 다양한 기능을 제공한다.

비동기 액션 creator을 직접 실행하는 `thunk`와 달리 

--

## take, take 시리즈, throttle

### take의 문제점

**딱 한 번만 실행됨**<br>
즉, 로그인 요청을 받으면 `yield take("LOG_IN_REQUEST", logIn)`가 실행된 후 사라지기 때문에 다음 요청을 받지 못하게 되는 것이다.

### 해결 방법

1. `while(true)`
```js
function* watchLogIn() {
  while (true) {
    yield take("LOG_IN_REQUEST", logIn);
  }
}
```
동기적으로 동작, 직관적이지 않아 잘 사용하지 않음

2. `takeEvery`
```js
function* watchLogIn() {
  yield takeEvery("LOG_IN_REQUEST", logIn);
}
```
비동기적으로 동작, 모든 클릭에 대해 동작됨

3. `takeLeading`

4. `takeLatest` : 여러 번 요청을 보낸 경우, 이전의 요청을 취소하고 제일 마지막 요청만 보냄 (이전의 요청이 완료된 경우는 가만히 나둠) -> **주로 사용됨**
> 하지만 실제로는 요청은 여러 번 보내지는 건 맞고, **응답할 때** 마지막 응답만 보내는 것이다. 따라서 서버 측에서 똑같은 데이터가 연달아 저장되었는지 검사를 해야한다.

5. `throttle`
```js
function* watchLogIn() {
  yield throttle("LOG_IN_REQUEST", logIn, 10000);
}
```
`takeLatest`의 대안.<br>
특정 시간동안 요청을 1번만 받을 수 있고, `takeLatest`와 달리 아예 프론트단에서 요청을 보내는 것을 막는다.
> `debounce`와 `throttle`의 차이<br>
https://www.zerocho.com/category/JavaScript/post/59a8e9cb15ac0000182794fa

서버를 구현하기 전까지 delay로 비동기적인 효과를 주도록 하자.
더미데이터 쓸때도 비동기 흉내내기 편하겠죠?

---

## saga 쪼개고 reducer와 연결하기

로그인 액션 하나가 발생하면 `watchLogIn`, `logIn`, `logInAPI` 이렇게 3개를 세트로 하여 실행되기 때문에 액션이 많아지면 그만큼 코드량도 많아지게 된다.

reducer를 쪼갤 때와 마찬가지로 saga의 경우도 reducer와 동일한 기준으로 쪼갤 수 있다.

```js
// sagas/user.js
import { all, fork, delay, put, takeLatest } from 'redux-saga/effects';

function logInAPI(data) {
  return axios.post("/api/login", data);
}

function* logIn(action) {
  try {
    // const result = yield call(logInAPI, action.data);
    yield delay(1000);
    yield put({
      type: "LOG_IN_SUCCESS",
      data: action.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_IN_FAILURE",
      data: err.respose.data,
    });
  }
}

function logOutAPI() {
  return axios.post("/api/logout");
}

function* logOut() {
  try {
    // const result = yield call(logOutAPI);
    yield delay(1000);
    yield put({
      type: "LOG_OUT_SUCCESS",
    });
  } catch (err) {
    yield put({
      type: "LOG_OUT_FAILURE",
      data: err.respose.data,
    });
  }
}

function* watchLogIn() {
  yield takeLatest("LOG_IN_REQUEST", logIn);
}

function* watchLogOut() {
  yield takeLatest("LOG_OUT_REQUEST", logOut);
}

export default function* userSaga() {
  yield all([
    fork(watchLogIn),
    fork(watchLogOut),
  ])
}
```

```js
// sagas/post.js
import { all, fork, delay, put, takeLatest } from 'redux-saga/effects';

function addPostAPI(data) {
  return axios.post("/api/post", data);
}

function* addPost(action) {
  try {
    // const result = yield call(addPostAPI, action.data);
    yield delay(1000);
    yield put({
      type: "ADD_POST_SUCCESS",
      data: action.data,
    });
  } catch (err) {
    yield put({
      type: "ADD_POST_FAILURE",
      data: err.respose.data,
    });
  }
}

function* watchAddPost() {
  yield takeLatest("ADD_POST_REQUEST", addPost);
}

export default function* postSaga() {
  yield all([
    fork(watchAddPost)
  ])
}
```
분리한 saga들은 `index.js`에서 다시 결합해준다.
```js
// sagas/index.js
import { all, fork } from "redux-saga/effects";

import userSaga from './user';
import postSaga from './post';

export default function* rootSaga() {
  yield all([
    fork(userSaga),
    fork(postSaga)
  ])
}
```

### saga에 맞게 reducer와 component 바꾸기

1. **로그인 시도중**, **로그아웃 시도중** 상태 추가
```js
// reducers/user.js
export const initialState = {
  isLoggingIn: false,   // 로그인 시도중
  isLoggedIn: false,
  isLoggingOut: false,  // 로그아웃 시도중
  me: null,
  signUpData: [],
  loginData: [],
};
```
로그인 요청을 보낼 때, `isLoggingIn`이 false 상태였다가 로그인이 성공하거나 실패했을 때 `isLoggingIn`을 true로 전환한다. (로그아웃 요청도 마찬가지)

2. `action.type`에 맞게 reducer의 case 추가
```js
// reducers/user.js
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOG_IN_REQUEST":
      return {
        ...state,
        isLoggingIn: true,
      };
    case "LOG_IN_SUCCESS":
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: true,
        me: { ...action.data, nickname: 'zerocho' },
      };
    case "LOG_IN_FAILURE":
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: false,
      };
    case "LOG_OUT_REQUEST":
      return {
        ...state,
        isLoggingOut: true,
      };
    case "LOG_OUT_SUCCESS":
      return {
        ...state,
        isLoggingOut: false,
        isLoggedIn: false,
        me: null,
      };
    case "LOG_OUT_FAILURE":
      return {
        ...state,
        isLoggingOut: false,
      };
    default:
      return state;
  }
};
```
`action.data`는 id와 password 정보만 담겨있고, nickname은 포함되지 않기 때문에 로그인 성공 시 `me`에 닉네임 정보도 넣어준다.

2. 실제 컴포넌트에서 상태를 가져다 쓰기

```js
// components/LoginForm.js
const { isLoggingIn } = useSelector((state) => state.user);
```
`useSelector`를 통해 `isLoggingIn`을 가져온 후 로그인 버튼의 loading 속성에다가 넣어준다.
```html
<Button type="primary" htmlType="submit" loading={isLoggingIn}>
  로그인
</Button>
```

(`components/UserProfile.js`에서도 `isLoggingOut`을 로그아웃 버튼의 loading 속성에 넣어줌.)

3. `SuccessAction`, `FailureAction` action creator은 더 이상 필요가 없는데, 액션을 saga에서 스스로 호출하고 있기 때문이다. `RequestAction` action creator만 남기고 나머지는 제거한다.

### 실행 흐름

1. 로그인 폼을 통해 로그인을 한다.
2. 로그인 폼 제출시 `loginRequestAction` action creator가 실행되면서 type이 `LOG_IN_REQUEST`인 action이 dispatch됨.
3. reducer 측과 saga 측에서 이 action을 동시에 감지함 (정확한 순서는 reducer -> saga)
4. reducer의 경우: reducer 함수에 의해 `isLoggingIn` 상태가 `true`로 바뀜