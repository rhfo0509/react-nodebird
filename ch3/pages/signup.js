import React, { useCallback, useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";
import Head from "next/head";
import styled from "styled-components";

import AppLayout from "../components/AppLayout";
import useInput from "../hooks/useInput";

const ErrorMessage = styled.div`
  color: red;
`;

const signup = () => {
  const [id, onChangeId] = useInput("");
  const [nickname, onChangeNickname] = useInput("");
  const [password, onChangePassword] = useInput("");

  const [passwordCheck, setPasswordCheck] = useState("");
  const [passwordError, setPassworkError] = useState(false);
  // "비밀번호 확인"의 경우 비밀번호와 비밀번호 확인이 일치하는지 여부를 검사하는 로직을 추가적으로 작성해야 해서 custom hook으로 합쳐줄 수 없다.
  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setPassworkError(e.target.value !== password);
    },
    [password]
  );

  const [term, setTerm] = useState("");
  const [termError, setTermError] = useState(false);
  const onChangeTerm = useCallback((e) => {
    setTerm(e.target.checked);
    // 약관동의X -> 약관동의O 가 되었을 때 termError를 true->false로 바꿔주기 위함
    setTermError(false);
  }, []);

  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPassworkError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    console.log(id, nickname, password);
  }, [password, passwordCheck, term]);

  return (
    <>
      <Head>
        <title>회원가입 | NodeBird</title>
      </Head>
      <AppLayout>
        <Form onFinish={onSubmit}>
          <div>
            <label htmlFor="user-id">아이디</label>
            <br />
            <Input name="user-id" value={id} required onChange={onChangeId} />
          </div>
          <div>
            <label htmlFor="user-nickname">닉네임</label>
            <br />
            <Input
              name="user-nickname"
              value={nickname}
              required
              onChange={onChangeNickname}
            />
          </div>
          <div>
            <label htmlFor="user-password">패스워드</label>
            <br />
            <Input
              name="user-password"
              type="password"
              value={password}
              required
              onChange={onChangePassword}
            />
          </div>
          <div>
            <label htmlFor="user-password-check">패스워드체크</label>
            <br />
            <Input
              name="user-password"
              type="password"
              value={passwordCheck}
              required
              onChange={onChangePasswordCheck}
            />
            {passwordError && (
              <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>
            )}
          </div>
          <div>
            <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
              제로초 말을 잘 들을 것을 동의합니다.
            </Checkbox>
            {termError && (
              <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            <Button type="primary" htmlType="submit">
              가입하기
            </Button>
          </div>
        </Form>
      </AppLayout>
    </>
  );
};

export default signup;
