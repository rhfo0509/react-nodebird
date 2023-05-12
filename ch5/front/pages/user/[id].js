import React, { useEffect } from "react";
import Head from "next/head";
import { Card, Avatar } from "antd";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { END } from "redux-saga";
import axios from "axios";
import wrapper from "../../store/configureStore";

import AppLayout from "../../components/AppLayout";
import PostCard from "../../components/PostCard";
import { LOAD_USER_POSTS_REQUEST } from "../../reducers/post";
import { LOAD_USER_REQUEST, LOAD_MY_INFO_REQUEST } from "../../reducers/user";

const User = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } =
    useSelector((state) => state.post);
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.scrollY + document.documentElement.clientHeight >
        document.documentElement.scrollHeight - 300
      ) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_USER_POSTS_REQUEST,
            lastId,
            data: id,
          });
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [mainPosts.length, hasMorePosts, loadPostsLoading]);
  return (
    <>
      <Head>
        <title>{userInfo.nickname}님의 글</title>
      </Head>
      <AppLayout>
        <Card
          actions={[
            <div key="twit">
              짹짹
              <br />
              {userInfo.Posts}
            </div>,
            <div key="followings">
              팔로잉
              <br />
              {userInfo.Followings}
            </div>,
            <div key="followers">
              팔로워
              <br />
              {userInfo.Followers}
            </div>,
          ]}
        >
          <Card.Meta
            avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
            title={userInfo.nickname}
          />
        </Card>
        {mainPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, params }) => {
      const cookie = req ? req.headers.cookie : "";
      axios.defaults.headers.Cookie = "";
      if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
      }
      store.dispatch({ type: LOAD_MY_INFO_REQUEST });
      store.dispatch({ type: LOAD_USER_REQUEST, data: params.id });
      store.dispatch({ type: LOAD_USER_POSTS_REQUEST, data: params.id });
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
);
export default User;
