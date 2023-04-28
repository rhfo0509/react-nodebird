# antd 사용해서 SNS 화면 만들기

## antd와 styled-components

`ant-design` : CSS 프레임워크, 미리 만들어놓은 버튼이나 아이콘 등을 가져다 쓰기만 하면 됨<br>
`styled-components` : 컴포넌트 자체에 CSS를 입혀서 컴포넌트로 만들어줌

### 설치

antd는 4버전을 설치한다.
```
npm i antd@4 styled-components @ant-design/icons@4
```

### 사용

사용하고 싶은 컴포넌트를 <a>https://ant.design/components/overview/</a> 에서 고른 후

`import { Menu } from "antd"` 와 같이 가져오면 된다.

---

## __app.js와 Head

### next.js에는 기본적으로 webpack이 들어있다.
> webpack이 css를 보는 순간 style 태그로 바꾼 후 html에 넣어줌

따라서 antd에 css를 적용시키려면<br>
`import 'antd/dist/antd.css'`을 하면 된다.

### 모든 페이지에 공통으로 antd를 적용하고 싶다면?

pages 폴더 내에서 <b>_app.js</b>를 작성하여 페이지들의 공통된 부분을 처리할 수 있다.

```javascript
// _app.js
import "antd/dist/antd.css";
import PropTypes from "prop-types";

const App = ({ Component }) => {
  return <Component />;
};

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default App;
```
> props 타입 체크를 통해 서비스의 안정성을 조금 더 높일 수 있다.

> 이 때 `<Component />` 는 pages 폴더에 있는 index.js, profile.js, signup.js가 리턴하는 컴포넌트가 들어갈 자리이다.

### `_app.js` vs `AppLayout.js`
* 모든 페이지에서 다 공통으로 사용한다면? -> `_app.js`에서 작성<br>

* 특정 컴포넌트끼리만 공통으로 사용되는 경우? -> `AppLayout.js`에서 작성 후 그 작성된 컴포넌트를 자식 컴포넌트에다 감싸면 된다.

### `<head>` 부분을 수정하고 싶은 경우
next에서 `<head>`를 수정할 수 있는 <b>Head</b> 컴포넌트를 제공한다.
```javascript
import Head from "next/head";

const App = ({ Component }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>NodeBird</title>
      </Head>
      <Component />;
    </>
  )
```
이렇게 <b>Head</b> 컴포넌트 안에 바꾸고 싶은 내용을 작성하면 된다.<br>
`_app.js` 뿐만 아니라 개별 컴포넌트에서도 <b>Head</b> 컴포넌트로 헤더 내용을 수정할 수 있다.

---

## 반응형 그리드 사용하기

### 적응형 vs 반응형
* <b>적응형</b>: 모바일 환경이면 모바일 레이아웃, 데스크탑 환경이면 데스크탑 레이아웃을 제공
* <b>반응형</b>: 화면의 크기에 따라 유동적으로 컴포넌트의 배치가 변경되는 방식

> 반응형을 할 수 있게 antd에서 `Row`와 `Col` 컴포넌트를 제공

### 반응형 구현 원칙

* 가로부터 설계 후 세로 설계
* 반응형을 구현할 때는 모바일 환경 우선으로 구현 후 태블릿 -> 데스크탑으로 점점 넓혀가는 것이 좋음

### `xs`(moblile) / `sm`(tablet) / `md`(desktop)

```html
<Row>
  <Col xs={24} md={6} />
  <Col xs={24} md={12} />
  <Col xs={24} md={6} />
</Row>
```

기본적으로 24 칸이 1 줄을 차지하며, 24 칸을 넘어설 경우 다음 줄로 넘어간다.

#### 모바일 환경의 경우

`xs={24}` 이 3개가 존재하기 때문에 각 Col 컴포넌트가 한 줄을 차지하게 되어 세로로 배치된다. 
![image](https://user-images.githubusercontent.com/85874042/230294390-968b8f7d-1c64-48dc-a198-04f6b4ddcaf8.png)

#### 데스크탑 환경의 경우

6 : 12 : 6 비율로 Col 컴포넌트가 한 줄에 가로로 배치된다.
![image](https://user-images.githubusercontent.com/85874042/230294615-31b62b76-0a21-4e51-affd-d57ba893460a.png)

#### `gutter`

컴포넌트가 따닥따닥 붙어있는 것을 막기 위해 컬럼 사이에 간격을 준다.

```html
<Row gutter={8}>
  <Col xs={24} md={6} />
  <Col xs={24} md={12} />
  <Col xs={24} md={6} />
</Row>
```

### `noreferrer noopener`
`target='_blank'` 시 `rel="noreferrer noopener"`를 추가하여 새 창을 누가 열었는지에 대한 정보를 제공하지 않음으로써 보안 위협을 방지

---

## 리렌더링 이해하기

### 인라인 스타일로 css 적용 시 문제점

```
<div style={{ marginTop : 10 }}>...</div>
```
렌더링 시 React는 Virtual DOM으로 검사하면서 어디가 달라졌는지를 찾는다.

이 때 `style` 객체의 경우 실제로는 바뀐 부분이 없지만, 렌더링되면서 똑같은 객체를 새로 생성하게 된다.

그리고 그 새로 만든 객체와 이전 객체를 비교한 결과는 항상 `false`이기 때문에 Virtual DOM는 상태가 변경되었다고 생각하게 되고, 그 결과 리렌더링이 발생하게 된다.

### `styled-components`

#### 사용 전 extension 설치
`vscode-styled-components` 확장 프로그램을 설치하면 autocomplete이 가능해진다.

#### 사용

```html
<!-- LoginForm.js -->
<ButtonWrapper>
  <Button type="primary" htmlType="submit" loading={false}>
    로그인
  </Button>
  <Link href="/signup">
    <a>회원가입</a>
  </Link>
</ButtonWrapper>
```

```javascript
// LoginForm.js
import styled from "styled-components";

const ButtonWrapper = styled.div`
  margin-top: 10px;
`;
```

`div` 컴포넌트이면서 `margin-top: 10px`인 css가 적용된 `ButtonWrapper` 컴포넌트가 생기게 되고, 이렇게 되면 객체가 만들어지지 않기 때문에 쓸데없는 리렌더링이 발생하지 않는다.
> 참고: 성능에 문제가 안되면 인라인 스타일 사용해도 된다. 개발 시에는 최적화 부분은 후순위로 미루는 것이 좋다.

#### 컴포넌트가 html 요소가 아니라면?

`<Input.Search enterButton style={{ verticalAlign: "middle" }} />` 와 같이 html 요소가 아닌 컴포넌트의 경우

```javascript
const SearchInput = styled(Input.Search)`
  vertical-align: middle;
`;
```
이렇게 괄호 안에 컴포넌트를 넣어주면 그 컴포넌트를 커스텀하게 스타일링할 수 있다.

### 성능 최적화는 하고 싶은데, `styled-components`는 사용하기 싫을 때

값을 캐싱하는 `useMemo` Hook 사용

```javascript
const style = useMemo(() => ({ marginTop: 10 }), []); 
```
이런 식으로 style 객체에 `useMemo`를 적용하고,
```html
<button style={style}>...</button>
```
로 `useMemo`로 감싼 style 객체를 적용시키면 더 이상 button 부분이 리렌더링되지 않음을 확인할 수 있다.

### 그래서 리렌더링이 뭘까?

이전 Virtual DOM과 업데이트된 Virtual DOM을 비교하여 달라진 부분만을 다시 그리는 기술이며, DOM을 직접 조작하지 않고 변경사항을 하나의 Virtual DOM에 모아놓았다가 한 번에 DOM에게 보낸다.<br>
<b>즉, 여러 번 render되지 않고 단 한번만 render가 되는 것이다.</b>

> 함수형 컴포넌트의 경우 함수 안에 있는 부분이 모두 실행되는 것은 맞으나 실제로는 return 부분에서도 바뀌는 부분만 다시 그리게 된다.

---

## 더미 데이터로 로그인하기

```html
<Form onFinish={onSubmitForm}>...</Form>
```
button `submit` 이벤트에 의해 폼이 제출되면 `onFinish` 이벤트 핸들러 내의 함수가 호출되며 `onFinish`의 경우 자동적으로 `e.preventDefault()`가 적용됨

### 서버 없이 로그인을 시켜주려면?

`AppLayout.js`에서 현재 로그인 상태를 나타내는 `isLoggedIn` 더미 데이터를 활용한다.<br>

1. 최초 상태는 `false`
2. 로그인 버튼 클릭 시 `isLoggedIn`을 `true`로 바꿔야하므로 `LoginForm` 컴포넌트에 `setIsLoggedIn`을 <b>props</b>로 전달한다.
3. `isLoggedIn` 상태가 `true`가 되어
`<UserProfile />` 컴포넌트가 렌더링됨
4. 이후 로그아웃 버튼 클릭 시 `isLoggedIn`을 `false`로 바꿔야하므로 `UserProfile` 컴포넌트에서도 `setIsLoggedIn`을 <b>props</b>로 전달한다.
5. `isLoggedIn`이 `false`가 되어 다시 `<LoginForm />` 컴포넌트가 렌더링됨

---

## 프로필 페이지 만들기

```javascript
const profile = () => {

  const followingList = [
    { nickname: "홍길동" }, 
    { nickname: "김수한무" }, 
    { nickname: "거북이와두루미" }
  ];
  const followerList = [
    { nickname: "홍길동" }, 
    { nickname: "김수한무" }, 
    { nickname: "거북이와두루미" }
  ];

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowerList header="팔로잉 목록" data={followingList} />
        <FollowerList header="팔로워 목록" data={followerList} />
      </AppLayout>
    </>
  );
};
```
`<NicknameEditForm />`, `<FollowerList />`와 같이 먼저 가상의 컴포넌트 및 컴포넌트에 props로 전달할 부분을 생각해놓고, 데이터의 경우는 더미 데이터로 만들어서 전달한 후 그 다음에 세부 구현을 하는 방식으로 진행한다.

---

## 회원가입 페이지 만들기

변수명은 줄이지 말고 풀네임으로 작성하도록 한다.
(ex. onChangeNick -> onChangeNickname) <br>
변수명을 의미있게 짓는 것이 보다 더 중요하기 때문이다.

### custom hook

#### hook을 쓸 수 있는 조건

* 함수 안이나 조건문, map과 같은 반복문 안에서는 기본적으로 hooks 사용이 허용되지 않음
* 컴포넌트 내에서만 사용이 가능하며, 컴포넌트 내에서도 deps가 한 단계 일때만 가능하다.
* 함수 내에서 hook을 쓸 수 있는 한 가지 조건이 있는데, 바로 <b>custom hook</b>을 사용할 때이다.

#### useInput

```javascript
const [id, setId] = useState('');
const onChangeId = useCallback((e) => {
  setId(e.target.value);
}, []);
```

`signup.js`와 `LoginForm.js`에서 같은 패턴의 hook들이 반복해서 사용되고 있음을 확인할 수 있다.
> <b>custom hook</b>을 만들어 중복을 최소화할 수 있는데, 이름은 <b>use+이름</b> 형식이여야 한다.

hooks 폴더 내에서 `useInput.js` 작성
```javascript
// useInput.js
import { useState, useCallback } from "react";

export default (initialValue = null) => {
  const [value, setValue] = useState(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return [value, handler];
};
```

useInput Hook을 만들었으면 이를 import해서 사용한다.
```javascript
// signup.js
...
import AppLayout from "../components/AppLayout";
import useInput from "../hooks/useInput";
...
const signup = () => {
  const [id, onChangeId] = useInput("");
  const [nickname, onChangeNickname] = useInput("");
  const [password, onChangePassword] = useInput("");
  ...
}
```
useInput의 value가 id에, handler가 onChangeId에 매칭되면서 코드가 보다 더 간결해짐을 확인할 수 있다.

### 사용자 입력 데이터 검증 시

> 사용자의 Input을 받는 부분은 입력할 때 뿐만 아니라 Form submit 할때나 서버단에서도 입력 데이터를 검증하는 로직이 필요하다.