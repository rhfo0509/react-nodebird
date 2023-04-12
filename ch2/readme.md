# Redux 연동하기

## Redux 설치와 필요성 소개

### `next-redux-wrapper`

next에 redux를 붙이는 과정이 꽤나 복잡한 데, 이를 간편하게 하도록 도와주는 라이브러리이다.

* `npm i redux next-redux-wrapper` 로 패키지 설치

* `store/configureStore.js` 작성

```js
import { createWrapper } from 'next-redux-wrapper';
import { createStore } from 'redux';

const configureStore = () => {
  const store = createStore(reducer);
  return store;
};

const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === 'development',
});

export default wrapper;
```

* `_app.js`에서 `wrapper.withRedux(App)`을 통해 NextJS와 Redux를 연동하여 모든 컴포넌트에서 Redux를 이용가능하도록 함

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

* MobX

 코드량이 적은 대신 실수 발생 시 에러 추적이 쉽지 않다는 단점이 있기 때문에 어느 정도 리액트 생태계를 이해하고 리액트를 자유자재로 다룰 수 있는 숙련자에게 좋다.

* Redux

에러가 나면 에러 추적이 쉽기 때문에 리액트 초보자에게 좋음, 그러나 코드량이 많아 생산성 측면에서는 마이너스다.
중앙 데이터 저장소가 너무 커지는 경우 reducer를 통해 여러 개로 쪼갤 수도 있다는 장점이 있다.

* Context API

만들고자 하는 서비스가 별로 크지 않은 경우 사용
중앙 데이터 저장소에서 데이터를 요청하고 받아오는 것이 비동기 방식인데 데이터 요청/성공/실패 시의 로직을 컴포넌트 내에서 작성하기 때문에 그 부분에서 대해서는 단점이 될 수 있다.

---

## 리덕스의 원리와 불변성

### 리덕스의 원리

![image](https://user-images.githubusercontent.com/85874042/231397626-0acb7c6c-0386-4cc0-b3a3-092b43111942.png)

1. App에 대한 전체 상태를 하나의 객체로 표현해두고
그것을 바꾸고 싶을때마다 `action`을 하나씩 만든다.
2. `action`이 `dispatch`될 때의 로직을 `reducer`를 통해 직접 구현한다.
3. `dispatch`를 하게 되면 `reducer`에 적어준 방식에 따라 저장소가 바뀐다.

* 단점

데이터를 하나씩 바꾸고 싶을 때마다 `action` 및 `reducer`를 하나씩 만들어줘야 됨 -> 코드량 증가
* 장점

`action` 하나하나가 redux에 기록이 됨 -> 지금까지 데이터를 어떻게 바꿔왔는지 내역을 추적 가능 (bug 잡기 편함) <br>데이터를 뒤로 돌렸다가 다시 되돌리는 것도 가능 (테스트하기 편함)

### 리덕스의 불변성

