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
키페어명.pem
```

### 인스턴스 연결

1. 인스턴스 클릭 후 연결 버튼 클릭
3. SSH 클라이언트로 가서 `ssh -i` 로 시작하는 부분을 복사
4. `.pem` 파일이 있는 경로로 이동한 후 붙여넣기
5. Are you sure you want to continue connecting (yes/no/[fingerprint])? -> yes 입력

`.pem` 키를 사용해서 ubuntu 원격 서버로 접근

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
>> 이러한 과정이 번거롭다면 **CI/CD**나 **docker**를 알아보는 것을 추천한다.

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
-> 백엔드 서버에 `.env` 파일이 없기 때문이다. (`.gitignore`에 의해 제외됨)

#### `.env` 파일 생성

1. `vim .env`
2. `a`(insert) 입력
3. 키값 적은 후 `ESC` -> `:wq` 입력 후 enter
4. `ls -a`를 통해 `.env`(숨긴 파일) 확인 및 `cat .env`로 내용 확인

#### `app.js` 파일 수정

`vim app.js` -> `app.listen` 부분의 포트를 80(HTTP)으로 수정

이제 `npx sequelize db:create`로 데이터베이스 생성 후 `npm start` 명령어를 입력하면 정상적으로 서버가 실행됨을 확인할 수 있다.

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/59a329ea-07b2-4cd2-8317-e96e30d4c785)

> `listen EACCES: permission denied 0.0.0.0:80` 오류 -> `sudo` 명령어를 통해 루트 권한에서 서버를 실행해야 함 - 루트 이외는 1023번 이하의 포트 실행 불가
---

## pm2 사용하기 (프론트/백 서버)

`node app`으로 실행한 서버의 경우, 그 서버의 터미널을 끄게 되면 서버도 같이 종료되지만(**foreground process**) `pm2`를 사용하면 터미널을 종료해도 서버가 계속 유지된다는 장점이 있다(**background process**).

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

맨 처음 서버 배포 시에는 db에 아무런 데이터가 없는 상태이기 때문에 `getStaticPath()`로 데이터를 불러오는 과정에서 에러가 발생하게 됨 -> 일단 제거한 뒤에 나중에 데이터가 생기면 about 페이지 추가

### 주의사항

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

3. cors 해결을 위해 백엔드 측 cors origin 부분에 프론트 서버 주소 추가 + 3065 -> 80번 포트로 변경
```js
// back/app.js
app.use(
  cors({ origin: ["http://localhost:3000", "http://13.209.98.165"], credentials: true })
);
...
app.listen(80, () => {
  console.log("서버 실행 중");
});
```

3. **pm2**를 통해 프론트 서버를 시작

`npx pm2 start npm -- start`

---

## 도메인 연결하기

프론트 서버와 백엔드 서버는 서로 다른 출처를 가지기 때문에 서로간에 쿠키가 공유되지 않는다. 

도메인을 이용해서 프론트 서버는 `nodebird.site` 도메인에서 실행되고, 백엔드 서버는 `api.nodebird.site` 서브도메인에서 실행되도록 하면 둘 사이의 쿠키 공유가 자동으로 이루어진다.

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/780c0c16-2347-4f90-940b-078bca0ab3e8)

> ~~이미 프론트 측에서 withCredentials 설정 및 백엔드 측에서 cors 설정을 마친 상태라면, `SameSite=None`으로 설정해서 쿠키 공유를 가능하게 하는 방법도 있다.~~

### 도메인 구매하기

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/04ec39ad-0cf2-4c1c-a890-ef560e3c0f3f)

가비아 같은 도메인 판매 사이트로 가서 도메인을 구매한 후

AWS **Route 53** -> 호스팅 영역 -> 호스팅 영역 생성 -> 결과로 나온 네임 서버(NS)를 가지고 도메인을 구매한 곳에 가서 네임 서버를 변경

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/02d847a2-9c27-4e85-943e-3fd5547497aa)

### 인스턴스 아이피 고정하기

AWS **EC2** -> 네트워크 및 보안 -> 탄력적 IP

탄력적 IP를 2개 만든 후, [탄력적 IP 주소 연결]을 통해 인스턴스 하나 당 IP를 연결시킴 -> 무료로 사용 가능

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/e5aaaffc-04a9-4b59-a74d-1eb5165861bc)

> **주의** : 인스턴스 제거 시 반드시 탄력적 IP도 같이 제거해야 한다. -> 제거안하면 요금이 부과됨

### 도메인 주소와 IP 주소 매핑

**Route 53**의 호스팅 영역으로 가서 **A** 레코드 생성 -> 백엔드 서버와 연결한 IP의 도메인 주소는 `api.nodebird.site`로, 프론트 서버와 연결한 IP의 도메인 주소는 `nodebird.site`로 설정

**CNAME**을 이용해 `www.nodebird.site`로 접속해도 `nodebird.site`로 이동이 되도록 할 수 있음

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/826251be-3548-42ca-bd4b-8e537947e9c3)

### backUrl, origin 수정

```js
// front/config/config.js
export const backUrl =
  process.env.NODE_ENV === "production"
    ? "http://api.nodebird.site"
    : "http://localhost:3065";
```

```js
// back/app.js
app.use(
  cors({ origin: ["http://localhost:3000" ,"http://nodebird.site"], credentials: true })
);
```

### 서버 간에 쿠키를 공유하기 위한 설정

```js
// back/app.js
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,   // 자바스크립트로 접근 불가
      secure: false,    // https 적용할 때 true
      domain: process.env.NODE.ENV === "production" && ".nodebird.site",
    },
  })
);
```

domain을 설정해줘야 `app.nodebird.site` 및 `nodebird.site` 사이에 쿠키 공유가 가능해진다.

---

## S3 연결하기

지금까지는 백엔드 서버 자체에 이미지를 업로드하고 있음 -> 백엔드 서버가 스케일링되면 이미지까지 같이 복사됨

이제 브라우저에서 사진을 업로드하면 백엔드 서버 대신 바로 **AWS S3**라는 클라우드 스토리지에 저장을 함으로써 이러한 문제를 해결할 수 있다.

S3에는 **Bucket**과 **Object**라는 단위가 있음
* 객체(Object): 데이터를 저장하는 기본 단위
* 버킷(Bucket): 객체를 저장하는 컨테이너

### 초기 세팅

1. AWS **S3** -> 버킷 만들기

2. 버킷 이름 지정 및 모든 퍼블릭 액세스 차단 체크 해제하기 (해제해야 브라우저에서 S3 스토리지에 접근이 가능해짐)

3. 버킷 생성 후 해당 버킷의 권한 부분에서 버킷 정책을 아래와 같이 작성
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AddPerm",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::버킷명/*"
    }
  ]
}
```

* `s3:GetObject`, `s3:PutObject` : 객체의 가져오기와 객체의 업로드 작업이 허용됨
* `Allow` + `arn:aws:s3:::버킷명/*` : 해당 버킷 내의 모든 객체에 대한 접근 권한이 부여됨

4. 보안 자격 증명 -> 액세스 키 만들기

생성 후 `.csv` 형식으로 된 키 파일을 다운로드 (남에게 절대 노출되면 안됨)

5. back 폴더로 가서 패키지 설치

`npm i multer-s3 aws-sdk`

6. `.env` -> `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`에 키 파일에 적힌 값을 추가
```
// back/.env
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```
백엔드 서버에서 `vim .env`을 통해 다시 한번 작성해야 함 (안 그러면 missing credentials 에러 발생)

### multer 설정

```js
// back/routes/post.js
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
...
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2"  // 대한민국(서울)
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: "버킷명",
    key(req, file, cb) {
      cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`)
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});
```

`AWS.config.update`를 통해 액세스 키 ID와 비밀 액세스 키를 설정

-> `s3` : AWS.S3 인스턴스를 생성하여 S3와 상호작용할 수 있게 됨

-> `bucket` : 지정한 버킷에 파일이 업로드됨

-> `key` : 콜백 함수에 저장 경로 및 파일명을 전달하여 S3에 저장할 위치를 지정

```js
// back/routes/post.js
router.post(
  "/images",
  upload.array("image"),
  isLoggedIn,
  async (req, res, next) => {
    try {
      console.log(req.files);
      res.status(200).json(req.files.map((v) => v.location));
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
```

`req.files.map((v) => v.location)` : 각 파일이 저장된 주소들을 배열로 반환
-> 프론트로 전달되어 `imagePaths`에 등록됨

바뀐 `imagePaths`에 맞게 `img` 태그의 `src` 속성도 수정한다.

---

## Lambda로 이미지 리사이징하기

### 이미지를 리사이징하는 이유

**모바일 환경**의 경우, 모니터 해상도에 해당하는 이미지를 업로드하게 되면 용량을 많이 차지하게 되어 로딩 속도가 느려지게 된다. 따라서 원본 이미지를 모바일 기기에 최적화된 이미지 크기로 변환하는 과정이 필요한데, 이를 **이미지 리사이징**이라고 한다.



### AWS Lambda와 이미지 리사이징

`AWS Lambda`는 **이벤트 기반의 서버리스 컴퓨팅 서비스**로, 이벤트가 발생하면 Lambda 함수가 자동으로 실행되는 방식으로 동작한다.

**이미지 리사이징**의 경우 이미지 처리에 많은 리소스와 계산이 필요한 작업이기 때문에 백엔드 서버에서 직접 구현하는 것은 많은 부담이 될 수 있다.

그렇다고 서버를 증설하는 것은 비용이 많이 들기 때문에 이미지 리사이징 전용 Lambda 함수를 만들어서 AWS S3 버킷에 이미지가 업로드될 때 이벤트가 트리거되어 Lambda 함수를 호출하는 방식으로 구현할 수 있다.

### 설정

1. lambda 폴더를 만들어 그 안에서 패키지 설치

`npm i aws-sdk sharp`

2. `index.js` 파일 작성

```js
// lambda/index.js
const AWS = require('aws-sdk');
const sharp = require('sharp');

// lambda가 알아서 사용자 정보를 불러오기 때문에 AWS.config.update가 필요하지 않음
const s3 = new AWS.S3();

// lambda는 한 가지 기능을 하는 "함수"
exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name; // react-nodebird-s3
  const Key = decodeURIComponent(event.Records[0].s3.object.key); // original/12312312_abc.png
  console.log(Bucket, Key);
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length - 1].toLowerCase();
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;
  console.log('filename', filename, 'ext', ext);

  try {
    // 지정된 버킷과 키에 해당하는 객체를 가져옴
    const s3Object = await s3.getObject({ Bucket, Key }).promise();
    console.log('original', s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body)
      .resize(400, 400, { fit: 'inside' })
      .toFormat(requiredFormat)
      .toBuffer();
    // 지정된 버킷에 객체(파일)를 업로드함
    // Body에는 업로드할 데이터가 들어감
    await s3.putObject({
      Bucket,
      Key: `thumb/${filename}`,
      Body: resizedImage,
    }).promise();
    console.log('put', resizedImage.length);
    return callback(null, `thumb/${filename}`);
  } catch (error) {
    console.error(error)
    return callback(error);
  }
}
```

* 한글로 된 파일명은 인코딩을 한 상태로 전송되기 때문에 `decodeURIComponent`를 통해 복원할 수 있다.

* 파일의 확장자를 `.jpg`로 설정하면 sharp 라이브러리가 제대로 동작하지 않을 수 있기 때문에 `.jpeg` 확장자를 사용한다.

3. 백엔드 서버 -> lambda 폴더로 가서 `npm i`

4. EC2에서 S3로 소스코드(`aws-upload.zip`)를 보내기 위해 다음과 같이 명령어 입력

```
sudo apt install zip
zip -r aws-upload.zip ./*
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

```
aws configure // 출력 포맷: json
aws s3 cp "aws-upload.zip" s3://버킷명
```

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/77ce93c1-6763-4750-8df3-97593890c3e4)

정상적으로 업로드되었음을 확인한 후

5. AWS **Lambda** -> 함수 생성 -> ~~핸들러를 `index.handler`(`index.js`에서 export한 `handler` 메서드를 의미)로 작성~~(기본으로 설정됨)

6. 에서 업로드 - **Amazon S3 위치** 클릭 -> 링크 URL에 `https://버킷명.s3.ap-northeast-2.amazonaws.com/aws-upload.zip` 작성

7. 구성 -> 실행 역할 편집 / 아래와 같이 작성

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/29fd6562-e67c-4abb-8d99-9688c583a0f4)

8. 트리거 추가 / 아래와 같이 작성

![image](https://github.com/rhfo0509/react-nodebird/assets/85874042/6e073fa1-1c37-4525-b49a-ebc268d50943)

이제 orginal 폴더에 파일 업로드가 감지되었을 때만 lambda 함수가 실행된다.

> lambda 함수가 제대로 실행되고 있는지는 **모니터링** 부분에서 확인할 수 있다.

### 코드 수정

이미지 업로드 시에는 `thumb` 내에 있는 리사이징된 이미지를, 상세보기 시에는 `original` 내에는 원본 이미지를 불러오도록 수정

```js
// back/routes/post.js
router.post(
  "/images",
  upload.array("image"),
  isLoggedIn,
  async (req, res, next) => {
    try {
      console.log(req.files);
      res.status(200).json(req.files.map((v) => v.location.replace(/\/original\//, '/thumb/')));
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
```

```js
// front/components/ImagesZoom/index.js
{images.map((v) => (
  <ImgWrapper key={v.src}>
    <img
      src={`${v.src.replace(/\/thumb\//, "/original/")}`}
      alt={v.src}
    />
  </ImgWrapper>
))}
```

업로드 완료보다 이미지 리사이징하는 데 시간이 걸리기 때문에 리사이징 끝나기 전에 이미지가 로드되는 현상 발생 -> `PostForm`에는 원본 사진을 가져오도록 변경
```js
// front/components/PostForm.js
{imagePaths.map((v, i) => (
  <div key={v} style={{ display: "inline-block" }}>
    <img
      src={v.replace(/\/thumb\//, "/original/")}
      style={{ width: "200px" }}
      alt={v}
    />
    <div>
      <Button onClick={onRemoveImage(i)}>제거</Button>
    </div>
  </div>
))}
```

> `Cannot find module '@aws-sdk/abort-controller'` 오류 해결방법 : `aws-sdk`와 `multer-s3`의 버전이 같아야 하기 때문에 `multer-s3`를 2버전으로 설치한다.

### **Creating an optimized production build...** 멈춤 현상 해결 방법

서버 메모리 부족으로 인해 빌드를 할 수 없는 상황이다.(`t2.micro`의 램은 고작 1기가) -> 로컬에서 빌드 후 빌드 결과물인 `.next`를 서버로 전송해서 서버에서는 실행만 하도록 한다.

---

## 카카오톡 공유하기
