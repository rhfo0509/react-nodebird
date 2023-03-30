# chapter 0

## Next.js

Next.js는 <b>React</b>로 만드는 <b>서버 사이트 렌더링 프레임워크</b>이다.<br>
Next.js에 대해 설명하기 전, 클라이언트 사이드 렌더링(CSR)과 서버 사이드 렌더링(SSR)에 대해 알아보자.

---

### 클라이언트 사이드 렌더링(CSR)

SPA(Single Page Application)의 등장에 따라 도입된 방식으로, React나 Vue, Angular 같은 자바스크립트 프레임워크들에서 SPA 방식을 사용한다.
> SPA는 서버로부터 매번 새로운 페이지를 가져오는 것이 아닌, 최초 한번 페이지 로드 후 필요한 부분만 ajax를 통해 데이터를 바인딩한다.

#### 작동 방식
1.
![image](https://user-images.githubusercontent.com/85874042/228757520-e6d2b14c-1052-4d41-aff1-933e6260445f.png)

이 때 index.html 파일은
```
<body>
  <div id="root"></div>
  <script src="app.js></script>
</body>
```
처럼 되어있기 때문에(데이터 X) 처음 접속하게 되면 먼저 빈 화면(로딩창)을 보게 된다.

2.
![image](https://user-images.githubusercontent.com/85874042/228756985-4f015cfd-7271-4e43-96dd-8a8cbdcfc429.png)

이 후에 app.js 파일을 서버로부터 다운받는데, 이 app.js에는 어플리케이션이 구동되기 위한 로직과 프레임워크, 라이브러리 파일들이 들어있기 때문에 다운로드 받는 데 많은 시간이 소요된다.

3.
![image](https://user-images.githubusercontent.com/85874042/228758426-f7132239-8048-4b89-9b3c-253210e9bedc.png)

그 외 필요에 따라 상품 추가, 수정, 삭제와 같이 추가로 필요한 api 요청을 한다면 서버에서 json 파일을 다운받아 app.js 자바스크립트 파일과 같이 동적으로 html을 생성한다.

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

1. SEO(Search Engine Optimization)를 위한 Server-Side Rendering(SSR)을 가능하도록 한다.

2. code spliting

3. pre-rendering
