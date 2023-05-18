import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import Router from "next/router";
import { END } from "redux-saga";
import axios from "axios";
import useSWR from "swr";
import wrapper from "../store/configureStore";

import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
import { backUrl } from "../config/config";

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((result) => result.data);

const profile = () => {
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);
  const { me } = useSelector((state) => state.user);
  const { data: followersData, error: followerError } = useSWR(
    `http://${backUrl}/user/followers?limit=${followersLimit}`,
    fetcher
  );
  const { data: followingsData, error: followingError } = useSWR(
    `http://${backUrl}/user/followings?limit=${followingsLimit}`,
    fetcher
  );

  useEffect(() => {
    if (!(me && me.id)) {
      Router.replace("/");
    }
  }, [me && me.id]);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);

  if (!me) {
    return <div>내 정보 로딩중...</div>;
  }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return <div>팔로잉/팔로워 로딩 중 에러가 발생하였습니다.</div>;
  }

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList
          header="팔로잉 목록"
          data={followingsData}
          onClickMore={loadMoreFollowings}
          loading={!(followingsData || followingError)}
        />
        <FollowList
          header="팔로워 목록"
          data={followersData}
          onClickMore={loadMoreFollowers}
          loading={!(followersData || followerError)}
        />
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req }) => {
      const cookie = req ? req.headers.cookie : "";
      axios.defaults.headers.Cookie = "";
      if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
      }
      store.dispatch({ type: LOAD_MY_INFO_REQUEST });
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
);

export default profile;
