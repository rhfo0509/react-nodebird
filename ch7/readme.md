# 보너스

## nginx + HTTPS 적용하기

### nginx

**웹 서버**의 일종으로, 클라이언트의 요청을 받아 서버로 전달하는 **리버스 프록시**의 역할을 수행한다. 이 과정에서 **리다이렉팅 기능**, **정적 파일 제공**, **SSL/TLS 프로토콜을 통한 HTTPS 연결 설정 기능** 등을 제공한다. (SSR 및 SSG 기능을 제공하는 next 서버와 구분)

### 기존 방식 vs nginx가 내부에 추가된 방식

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/44513cb1-f4af-412d-b9e3-833b3833e347)

* 기존 방식의 경우 443번 포트로 온 요청은 바로 next 서버로 보내고, 80번 포트로 온 요청은 프론트 서버에서 443번 포트로 리다이렉트 시켜서 next 서버로 보낸다.

* nginx가 추가된 방식의 경우 80번 포트로 온 요청을 nginx 서버에서 내부적으로 443번 포트로 리다이렉트 시킨 후 next 서버로 보낸다는 점에서 기존 방식과 차이가 있다.

### nginx 설치

```
sudo su
npx pm2 kill  // pm2가 실행 중인 경우
sudo lsof -i tcp:80 // 나오는 값이 없어야 함, 나온다면 sudo kill -9 PID

sudo apt-get install -y nginx
vim /etc/nginx/nginx.conf
```

`nginx.conf` -> http 객체 내에서 다음과 같이 작성 (도메인명과 프록시 포트는 자신이 설정한 대로 넣어줌)

이 부분이 **리버스 프록시** 역할을 수행한다 (**80**번 포트로 온 요청을 **3000**번 포트를 사용하는 next 서버로 전달)

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/05d2d816-a3c3-4971-8ad1-b5a4ec5b64b6)

```
sudo systemctl start nginx
sudo lsof -i tcp:80
```
80번 포트를 nginx 프로세스가 차지하고 있는 것을 확인한 후 다음으로 넘어간다.

### Let's Encrypt

Let's Encrypt를 통해 HTTPS 연결을 위한 무료 SSL/TLS 인증서를 발급하고 관리할 수 있음 -> 유효기간 : 3개월 / 갱신 가능

**공개키/비밀키** 방식을 사용하는데, 서버 측에서 제공하는 공개키로 사용자가 암호화하고 서버는 그 공개키에 대응하는 비밀키로 복호화한다. 비밀키는 서버만 가지고 있기 때문에 안전하며, 데이터의 기밀성과 무결성을 보장한다.

#### 설치

```
sudo snap install certbot --classic
sudo certbot --nginx
```

자신의 이메일을 입력하고, 약관에 동의한 후 원하는 도메인을 입력하면 인증서가 발급된다. (`fullchain` 및 `privkey` 경로를 잘 기억하자)

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/e520b430-9078-4214-8ad4-30786656a539)

다시 `nginx.conf`을 열어보면

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/6ae89518-b283-44b6-a170-a37f53cfd17d)

이렇게 certbot이 작성한 코드가 추가되었음을 확인할 수 있다.

마지막으로 `package.json`을 열어서 start 부분의 포트 번호를 다시 3000으로 변경한다. (nginx가 80을 쓰기 때문에 next 서버의 포트 번호는 이제 3000)

이제 `nodebird.site`로 접속하면 https가 정상적으로 적용이 된 걸 확인할 수 있다.

> CNAME으로 설정한 서브도메인에도 HTTPS를 설정하려면? -> `sudo certbot --nginx -d 도메인명 -d 서브도메인명`

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/b690e5ac-0fcb-438d-bbf9-0095a8ff323a)

---

## 백엔드 서버에 https 적용하기

프론트 서버에 https 적용하는 것과 동일 -> **next** 서버(3000)가 **express** 서버(3065)로 바뀐 점만 차이가 있다. 

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/8169c817-fdbb-4ce4-8da3-218bec363e73)

> 한 컴퓨터 내에서 프론트/백엔드 서버가 같이 가동되는 경우 \*(wildcard)를 통해서 인증서를 발급받아야 함 -> 이 때 http가 아닌 dns 방식으로 받아야 하며, 추가적으로 Route53에서 txt 레코드 설정이 필요하다.

여기서도 `app.js` 파일을 열어 **80**으로 설정된 포트 번호를 **3065**(express 서버)로 바꿔준다.

### Mixed Content Error

**HTTPS**(`https://nodebird.site` - 브라우저)에서 **HTTP**(`http://api.nodebird.site/user/login` - 백엔드 서버)로 요청을 보낼 때 생기는 에러

`front/config/config.js` -> `backUrl`를 http 대신 https로 작성한다.  

### CORS Error

CORS 문제는 **백엔드** 서버에서 발생하는 문제

`back/app.js` -> cors의 origin 부분에 `http`로 적혀있는 주소를 `https`로 변경 + session cookie의 secure를 `true`로 설정(`https`를 통해서만 쿠키가 전송됨)

### session cookie의 secure 적용이 안되는 문제

* `vim app.js` -> `trust proxy` 및 session proxy를 `true`로 설정

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/9a5dfddb-9e70-4212-8c55-b2a26ea67d81)

* `vim /etc/nginx/nginx.conf` -> `X-Forwarded-Proto $scheme` 추가

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/5bb366f4-b46f-4a7e-aeec-3d6bbba90a66)



### prefetch 문제

일반적으로 `Link` 컴포넌트의 경우 hover 시에 리소스가 사전에 로드됨(prefetch) -> 메인에 보이는 수많은 사용자와 해시태그가 prefetch되면 서버에 무리가 감

`Link` 컴포넌트의 prefetch를 `false`로 설정하면 더 이상 prefetch되지 않는다.

---

## 게시글 수정하기 - 完

리트윗한 게시글의 경우 수정할 수 없도록 한다.

`{!post.RetweetId && <Button>수정</Button>}`

---

## 팔로잉한 게시글만 가져오기 - 完

unrelated / 팔로잉하지 않은 게시글을 가져올 때는 자기 자신의 글을 제외하려면
`followings.map((v) => v.id).concat(req.user.id)` 이런 식으로 `concat` 메서드를 사용

---

## 빠르게 어드민 페이지 만들기

https://www.forestadmin.com/ 

MySQL과 sequelize를 분석하여 CRUD, dashboard와 같은 유용한 기능들을 제공하는 어드민 페이징;디/

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/d11e6fe4-7f3f-4d77-80ca-49a665f88c0c)

데이터베이스가 로컬에서 실행 중인 경우 Ngrok과 같은 터널링 소프트웨어를 통해 데이터베이스를 인터넷으로 공유해야 한다.

### ngrok

1. https://ngrok.com/ (회원가입 및 ngrok 다운로드)

2. 다운로드된 파일로 들어가서 https://dashboard.ngrok.com/get-started/your-authtoken -> command line에 적힌 부분 입력

3. `ngrok tcp 3306` 입력

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/2ded977a-0946-44ae-8164-687a2862bd94)

설정을 마치면 DB와 연동된 관리자 페이지를 볼 수 있게 된다.

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/9101c6b4-a696-4dd2-9c60-c091adbd6bb3)

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/18ad5a66-65b6-4609-b993-2ac117b71cbe)

> 실제 프로덕션 서버에 어드민 페이지 배포도 가능하다.








