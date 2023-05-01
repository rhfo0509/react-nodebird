import React, { useCallback, useEffect } from "react";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../hooks/useInput";

import { loginRequestAction } from "../reducers/user";

const ButtonWrapper = styled.div`
  margin-top: 10px;
`;

const LoginForm = () => {
  const [email, onChangeEmail] = useInput("");
  const [password, onChangePassword] = useInput("");
  const dispatch = useDispatch();
  const { logInLoading, logInError } = useSelector((state) => state.user);

  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);

  const onSubmitForm = useCallback(() => {
    console.log(email, password);
    dispatch(loginRequestAction({ email, password }));
  }, [email, password]);

  return (
    <Form onFinish={onSubmitForm}>
      <div>
        <label htmlFor="user-email">이메일</label>
        <br />
        <Input
          name="user-email"
          value={email}
          type="email"
          onChange={onChangeEmail}
          required
        />
      </div>
      <div>
        <label htmlFor="user-password">패스워드</label>
        <br />
        <Input
          name="user-password"
          type="password"
          value={password}
          onChange={onChangePassword}
          required
        />
      </div>
      <ButtonWrapper>
        <Button type="primary" htmlType="submit" loading={logInLoading}>
          로그인
        </Button>
        <Link href="/signup">
          <a>회원가입</a>
        </Link>
      </ButtonWrapper>
    </Form>
  );
};

export default LoginForm;
