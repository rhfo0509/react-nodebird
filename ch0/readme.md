# ch0. Hello, Next.js

## Next.js

Next.js는 <b>React</b>로 만드는 <b>서버 사이드 렌더링 프레임워크</b>이다.<br>
Next.js에 대해 설명하기 전, 클라이언트 사이드 렌더링(CSR)과 서버 사이드 렌더링(SSR)에 대해 알아보자.

---

### 클라이언트 사이드 렌더링(CSR)

SPA(Single Page Application)의 등장에 따라 도입된 방식으로, React나 Vue, Angular 같은 자바스크립트 프레임워크들에서 SPA 방식을 사용한다.
> SPA는 서버로부터 매번 새로운 페이지를 가져오는 것이 아닌, 최초 한번 페이지 로드 후 필요한 부분의 데이터만 가져오는 방식이다.

#### 작동 방식
1.
![image](https://user-images.githubusercontent.com/85874042/228757520-e6d2b14c-1052-4d41-aff1-933e6260445f.png)

이 때 index.html 파일은
```html
<body>
  <div id="root"></div>
  <script src="app.js"></script>
</body>
```
처럼 되어있기 때문에(데이터 X) 처음 접속하게 되면 먼저 빈 화면(로딩창)을 보게 된다.

2.
![image](https://user-images.githubusercontent.com/85874042/228756985-4f015cfd-7271-4e43-96dd-8a8cbdcfc429.png)

이후에 app.js 파일을 서버로부터 다운받는데, 이 app.js에는 어플리케이션이 구동되기 위한 로직과 프레임워크, 라이브러리 파일들이 들어있기 때문에 다운로드 받는 데 많은 시간이 소요된다.

3.
![image](https://user-images.githubusercontent.com/85874042/228758426-f7132239-8048-4b89-9b3c-253210e9bedc.png)

나중에 상품 추가, 수정, 삭제와 같이 추가로 api 요청을 하는 경우에 서버로부터 필요한 json 데이터를 다운받아 페이지를 구성하게 된다.

#### 장점

1. 초기 로딩만 제외하면 이 후 페이지 이동 시 필요한 데이터만 서버에 요청하기 때문에 SSR에 비해 속도가 빠르다.
2. 1번 때문에 서버에 부담을 덜 할수 있음
3. 페이지 이동 시 blinking 현상이 없음 - 사용자 친화적

#### 단점

1. 처음 화면 로딩 속도가 느림 - app.js 파일의 용량이 크기 때문에 많은 시간이 소요
2. 나쁜 SEO - index.html 파일은 빈 껍데기이기 때문에 검색엔진이 받아들이지 못함

---

### 서버 사이드 렌더링(SSR)

클라이언트 측에서 렌더링이 일어나는 CSR 방식과는 달리, 서버에서 html 파일을 만들어 클라이언트에게 보내주는 방식이다.

#### 작동 방식

![image](https://user-images.githubusercontent.com/85874042/228765763-559e8ba0-25b3-4a0c-8cea-e3d91605664d.png)

#### 장점

1. 처음 로딩 시 화면을 보는 시간이 빨라짐
2. SEO, 검색엔진 최적화 - 서버로부터 완전하게 만들어진 html 파일을 받아오기 때문에 SEO에 유리

#### 단점

1. 페이지 이동 시 모든 html 파일을 다시 받아오기 때문에 blinking 현상 발생
2. TTV(Time To View)와 TTI(Time To Interact) 간에 시간 간격이 존재 - html 파일을 받아오는 시간과 JS 파일을 받아오는 시간의 간격이 존재하기 때문에 화면을 클릭했을 때 아무런 action이 일어나지 않을 수도 있음
3. 서버에 요청을 많이 하기 때문에 서버에 과부하가 올 수 있음

---

### Next.js를 사용하는 이유

> 기본적으로 CSR 방식을 사용하는 React의 경우, 최초 웹사이트 요청 시 빈 html부터 로딩하고 이 후 스크립트를 로딩하기 때문에 초기 페이지 로딩시간이 늦어지고 SEO에서도 불리

### Next.js의 동작 방식

1. pre-rendering

처음 웹페이지 방문 시에는 SSR 방식으로 FE 서버, BE 서버, 데이터베이스를 거쳐 html 파일과 데이터를 합쳐서 화면에 그려주고, 이후 링크 타고 이동 시에는 CSR 방식을 사용한다.

> SSG(Static-Site-Generation): 빌드 시점에 HTML 문서를 각 페이지별로 생성하고 해당 페이지에 요청이 올 경우 이미 생성된 HTML 문서를 반환한다.  --- 마케팅 페이지, 제품 목록, 블로그 게시물 등 요청에 따라 동일한 결과를 반환하는 경우<br>
> SSR(Server-Side-Rendering): 유저에 페이지를 요청할 때마다 그에 맞는 HTML 문서를 생성해서 반환한다. --- 분석 차트나 게시판 같이 유저의 요청에 따라 동적으로 페이지를 생성해야 하는 경우

2. pre-fetching

Link 컴포넌트를 사용하여 들어갈 가능성이 있는 페이지를 미리 가져오고, 그 페이지를 클릭하는 경우 새롭게 HTML부터 다시 받아오는 것이 아닌 바로 렌더링을 해서 보여준다.

`import Link from 'next/link'` 이후

```js
<Link href="/"><a>노드버드</a></Link>
<Link href="/profile"><a>프로필</a></Link>
<Link href="/signup"><a>회원가입</a></Link>
```

처럼 `<a>` 태그가 아닌 `<Link>` 태그에 href 속성을 넣어준다.

3. code spliting

첫 페이지가 로딩될 때 거대한 javascript payload를 보내는 대신 번들을 여러 조각으로 조각내어서 페이지가 호출하는 모듈만 import하여 로딩 시간을 단축한다.

4. page based routing

/pages 폴더 내에서 컴포넌트를 export하는 경우 폴더명이 페이지 주소가 된다.<br>
즉, pages 폴더 내에 있는 파일들을 next.js가 인식해서 개별적인 페이지를 만들어주는 것이다.

- `pages/index.js` -> `localhost:3000/`
- `pages/about/ungnam.js` -> `localhost:3000/about/ungnam`

---

### Proptypes
부모로부터 전달받은 props의 데이터 타입을 검사<br>

`npm i prop-types`로 패키지를 설치

![image](https://user-images.githubusercontent.com/85874042/229047585-6a6c136a-94b5-434b-a382-5dfeaea3f217.png)

![image](https://user-images.githubusercontent.com/85874042/229047978-c8040745-1c7e-42b5-a551-10f852993f81.png)

index.js의 AppLayout 컴포넌트 내에 있는 `<div>Hello Next!</div>`를 AppLayout.js에서 <b>props.children</b>으로 받을 수 있고,
이 children의 데이터 타입이 `PropTypes.node`인지 검사한다.

* `PropTypes.node`: 렌더링될 수 있는 타입인지에 대해 검사
* `PropTypes.element`: 리액트 요소인지 검사 ex) `<div>123</div>`, `<Component />`

---

### components 폴더와 pages 폴더

<b>components</b> : 여러 페이지에 공통으로 적용되는 재사용 가능한 컴포넌트인 경우 여기에 작성<br>
<b>pages</b> : 일반적인 페이지 컴포넌트의 경우 여기에 작성



