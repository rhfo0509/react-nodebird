const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");
const passportConfig = require("./passport");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");

const app = express();

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch(console.error);
passportConfig();

app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello express");
});

app.use("/post", postRouter);
app.use("/user", userRouter);

app.listen(3065, () => {
  console.log("서버 실행 중");
});
