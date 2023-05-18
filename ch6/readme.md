# AWS에 배포하기

## EC2 생성하기

### EC2(Elastic Compute Cloud)

AWS에서 제공하는 클라우드 컴퓨팅 서비스로, **인스턴스**라는 것을 통해 원격으로 제어할 수 있는 가상의 컴퓨터를 임대받을 수 있다.<br>
*Elastic*에는 사용한 만큼 비용을 지불하고, 필요에 따라 성능과 용량을 자유롭게 조절할 수 있다는 의미가 담겨있다.

### 인스턴스 생성

1. AMI : Ubuntu(**프리티어** - 월 750시간 무료)
2. 인스턴스 유형 : t2.micro(프리티어)
3. 키 페어 생성(RSA/.pem) : 확장자가 `.pem`인 파일 하나가 생성됨 -> 프로젝트 폴더에 옮기기
4. 네트워크 설정 : 인터넷에서 HTTPS(**443**)/HTTP(**80**) 트래픽 허용 체크

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/a44d3490-0a51-4998-8fe4-58dcf10dcead)

생성 후, 소스코드를 **github**에 올린다(`git push origin master`). github에 올리면 원격 컴퓨터에서 git을 통해 소스코드를 다운받을 수 있게 된다. 이 때 `.gitignore` 파일을 만들어 아래 4가지는 제외시킨다.

```
node_modules/
.next/
.env
react-nodebird-aws.pem
```

### 인스턴스 연결

1. 인스턴스 클릭 후 연결 버튼 클릭
2. SSH 클라이언트 선택
3. `ssh -i` 로 시작하는 부분을 복사
4. `.pem` 파일이 있는 경로로 이동한 후 붙여넣기
5. Are you sure you want to continue connecting (yes/no/[fingerprint])? -> yes 입력

`.pem` 키를 사용해서 ubuntu 서버로 접근

6. `git clone 깃헙주소` -> 깃헙에 있는 소스코드를 원격 서버에서 다운 가능

> 윈도우 측에서 소스코드를 변경하면 `git pull`을 통해 원격 서버에도 변경사항을 반영해야 한다.

---

## 우분투에서 노드 설치하기 (프론트/백 서버)

### 설치 명령어

```
sudo apt-get update
sudo apt-get install -y build-essential
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash --
sudo apt-get install -y nodejs
```
* npm이 제대로 동작하기 위해서는 `build-essential` 패키지를 설치해야 함

* 노드의 경우 14버전보다 상위 버전을 설치할 시 에러가 발생할 수 있기 때문에 14버전으로 설치

* 전부 설치되었으면 `node -v`, `npm -v`로 설치되었는지 확인 -> `npm i`를 통해 패키지 설치

* 백엔드 서버에서도 같은 과정을 반복한다.

> 소스코드 변경 시 과정 : (윈도우) `git push origin master` -> (AWS) `git pull` -> `npm i`(패키지 설치 시) -> `npm run build`(프론트 서버) -> `npm start`
>> 이러한 과정이 번거롭다면 **CI/CD** 툴을 통해 개발 및 배포 과정을 자동화할 수 있다.

---

## 우분투에 MySQL 설치하기 (백 서버)

### 설치 명령어

```
sudo apt-get install -y mysql-server

// 루트 사용자로 전환 후 mysql_secure_installation로 비밀번호 설정
sudo su
mysql_secure_installation
```

> 이 때 비밀번호 설정 도중<br>
`... Failed! Error: SET PASSWORD has no significance for user 'root'@'localhost'`가 뜬다면...
>> 1. 서버 재접속 후 `sudo mysql` 입력
>> 2. `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password by '새패스워드'` 입력
>> 3. `sudo su` -> `mysql_secure_installation` -> 비밀번호를 바꾸겠냐는 질문을 제외한 나머지 질문에 y로 답하면 끝

### `npm start`로 백엔드 서버 실행

```
// back/package.json
...
"scripts": {
  "dev": "nodemon app",
  "start": "node app"
}
...
```

`npm start`를 입력하면 `Access denied for user 'root'@'localhost'`라는 오류가 출력됨
-> 백엔드 서버에 `.env` 파일이 없기 때문이다. (`.gitignore`을 통해 제외했기 때문)

#### `.env` 파일 생성

1. `vim .env`
2. `a`(insert) 입력
3. 키값 적은 후 `ESC` -> `:wq` 입력 후 enter
4. `ls -a`를 통해 `.env`(숨긴 파일) 확인 및 `cat .env`로 내용 확인

#### `app.js` 파일 수정

`vim app.js` -> `app.listen` 부분의 포트를 80(HTTP)으로 수정

이제 `npx sequelize db:create`로 데이터베이스 생성 후 `npm start` 명령어를 입력하면 정상적으로 서버가 실행됨을 확인할 수 있다.

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/59a329ea-07b2-4cd2-8317-e96e30d4c785)

> `listen EACCES: permission denied 0.0.0.0:80` 오류 -> `sudo su`를 통해 루트 권한에서 서버를 실행해야 함 - 루트 이외는 1023번 이하의 포트 실행 불가
---

## pm2 사용하기

`node app`으로 실행한 서버의 경우, 그 서버의 터미널을 끄게 되면 서버도 같이 종료되지만(**foreground process**) `pm2`를 사용하면 터미널을 종료해도 서버가 계속 유지된다(**background process**).

이외에도 pm2는 프로세스 및 로그 관리, 자동 재시작 등 여러가지 유용한 기능들을 제공한다.

### 설치

`npm i pm2` -> `vim package.json`을 통해 start 부분을 `node app`이 아닌 `pm2 start app.js`로 변경

`npm start`로 서버를 실행하면

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/e5125d25-102a-47f5-9403-3428922374f8)

이렇게 백그라운드 프로세스가 생성된 후 또 다른 명령어를 칠 수 있도록 커서가 활성화된다.

### pm2 명령어

```
npx pm2 monit       // 서버 상태 확인
npx pm2 kill        // 모든 프로세스 제거
npx pm2 list        // 프로세스 목록
npx pm2 reload all  // 모든 프로세스 재시작
```

### app.js 수정

```js
// back/app.js
...
if (process.env.NODE_ENV === 'production') {
  app.use(morgan("combined"));
  app.use(hpp());
  app.use(helmet());
} else {
  app.use(morgan("dev"));
}
...
```

`hpp()`, `helmet()` 미들웨어를 통해 애플리케이션 개발 및 디버깅 중에도 잠재적인 보안 취약성을 사전에 방지하고 예방할 수 있다.

```
// back/package.json
...
"scripts": {
  "dev": "nodemon app",
  "start": "cross-env NODE_ENV=production pm2 start app.js"
}
...
```
이제 `npm start` 시에 자동으로 개발 모드로 전환 및 pm2가 적용이 될 것이다.

---

## 프론트 서버 배포하기

### `getStaticPath()`가 있는 about 페이지

맨 처음 서버 배포 시에 db에 아무런 데이터가 없는 상태이기 때문에 `getStaticPath()`로 데이터를 불러오는 과정에서 에러가 발생하게 됨 -> 일단 없앤 뒤에 나중에 데이터가 생기면 about 페이지 추가

### ㅋㅋ

**프론트 서버는 백 서버가 켜져 있지 않으면 실행이 되지 않음**<br>

1. 백엔드 주소를 변수로 둬서 관리

```js
export const backUrl = "13.124.225.211";
```

기존 백엔드 주소(`http://localhost:3065`)를 사용하는 페이지 및 컴포넌트로 가서 그 부분을 전부 backUrl로 수정

2. `npm start` 시 80번 포트로 실행되도록 변경
```
// front/package.json
...
"scripts": {
  "dev": "next",
  "start": "cross-env NODE_ENV=production next start -p 80",
  "build": "cross-env ANALYZE=true NODE_ENV=production next build"
}
...
```

3. pm2를 통해 프론트 서버를 시작

`npx pm2 start npm -- start`