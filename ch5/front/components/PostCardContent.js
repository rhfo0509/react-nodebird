import React, { useCallback } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import { Input, Button } from "antd";
import useInput from "../hooks/useInput";

const PostCardContent = ({
  postData,
  editMode,
  onChangePost,
  onCancelUpdate,
}) => {
  const [editText, onChangeEditText, setEditText] = useInput(postData);
  // const onClickEdit = useCallback(() => {
  //   setEditMode(false);
  //   onChangePost(editText);
  // }, []);
  const onClickCancel = useCallback(() => {
    setEditText(postData);
    onCancelUpdate();
  }, []);
  return editMode ? (
    <>
      <Input.TextArea value={editText} onChange={onChangeEditText} />
      <Button onClick={onChangePost(editText)}>수정</Button>
      <Button type="danger" onClick={onClickCancel}>
        취소
      </Button>
    </>
  ) : (
    <div>
      {postData.split(/(#[^\s#]+)/g).map((v, i) => {
        if (v.match(/(#[^\s#]+)/)) {
          return (
            <Link key={i} href={`/hashtag/${v.slice(1)}`}>
              <a>{v}</a>
            </Link>
          );
        }
        return v;
      })}
    </div>
  );
};

PostCardContent.propTypes = {
  postData: PropTypes.string.isRequired,
  editMode: PropTypes.bool,
  onChangePost: PropTypes.func,
  onCancelUpdate: PropTypes.func,
};

export default PostCardContent;
