import React, { useCallback, useState } from "react";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import styled from "styled-components";
import PropTypes from "prop-types";

const ButtonWrapper = styled.div`
  margin-top: 10px;
`;

const LoginForm = ({ setIsLoggedIn }) => {
  // const style = useMemo(() => ({ marginTop: 10 }), []);

  const [id, setId] = useState("");
  // 최적화를 위해 컴포넌트에 props로 넘겨주는 함수의 경우 useCallback으로 꼭 감싸준다.
  const onChangeId = useCallback((e) => {
    setId(e.target.value);
  }, []);

  const [password, setPassword] = useState("");
  const onChangePassword = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const onSubmitForm = useCallback(
    () => {
      console.log(id, password);
      setIsLoggedIn(true);
    },
    [id, password]
  );

  return (
    <Form onFinish={onSubmitForm}>
      <div>
        <label htmlFor="user-id">아이디</label>
        <br />
        <Input name="user-id" value={id} onChange={onChangeId} required />
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
        <Button type="primary" htmlType="submit" loading={false}>
          로그인
        </Button>
        <Link href="/signup">
          <a>회원가입</a>
        </Link>
      </ButtonWrapper>
    </Form>
  );
};

LoginForm.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
};

export default LoginForm;
