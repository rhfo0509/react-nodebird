import React, { useCallback } from "react";
import { Form, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../hooks/useInput";
import { CHANGE_NICKNAME_REQUEST } from "../reducers/user";

const NicknameEditForm = () => {
  const dispatch = useDispatch();
  const { me, changeNicknameLoading } = useSelector((state) => state.user);
  const [nickname, onChangeNickname] = useInput(me?.nickname || "");

  const onSubmitForm = useCallback(() => {
    dispatch({ type: CHANGE_NICKNAME_REQUEST, data: nickname });
  }, [nickname]);

  return (
    <Form style={{ marginBottom: "20px", border: "1px solid #d9d9d9 20px" }}>
      <Input.Search
        addonBefore="닉네임"
        enterButton="수정"
        value={nickname}
        onChange={onChangeNickname}
        onSearch={onSubmitForm}
        loading={changeNicknameLoading}
        required
      />
    </Form>
  );
};

export default NicknameEditForm;
