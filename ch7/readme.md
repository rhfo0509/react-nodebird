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

`nginx.conf` -> http 객체 내에 server를 만들어 자신의 도메인 및 프록시 포트를 가지고 다음과 같이 작성 (이 부분이 **리버스 프록시** 역할을 수행한다)

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/05d2d816-a3c3-4971-8ad1-b5a4ec5b64b6)

```
sudo systemctl start nginx  // nginx 실행
sudo lsof -i tcp:80 // nginx가 보이면 정상
```

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
* 443번 포트로 요청 -> 3000번 
* 

마지막으로 `package.json`을 열어서 start 부분의 포트 번호를 다시 3000으로 변경한다. (nginx가 80을 쓰기 때문에 next 서버의 포트 번호는 이제 3000)

이제 `nodebird.site`로 접속하면 https가 정상적으로 적용이 된 걸 확인할 수 있다.

> CNAME으로 설정한 서브도메인에도 HTTPS를 설정하려면? -> `sudo certbot --nginx -d 도메인명 -d 서브도메인명`

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/b690e5ac-0fcb-438d-bbf9-0095a8ff323a)

---

## 백엔드 서버에 https 적용하기

프론트 서버에 https 적용하는 것과 동일 -> **next** 서버(3000)가 **express** 서버(3065)로 바뀐 점만 차이가 있다. 

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/8169c817-fdbb-4ce4-8da3-218bec363e73)

> 한 컴퓨터 내에서 프론트/백엔드 서버가 같이 있으면 *(wildcard)를 통해서 인증서를 발급받아야 하는데 이 때 http로 못받고 dns로 받아야 함. (* 인증서는 route53에서 txt 레코드 설정이 필요)




