import React from "react";
import { useRouter } from "next/router";

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div>{id}번째 게시글</div>
  );
};

export default Post;
