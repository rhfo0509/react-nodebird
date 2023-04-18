import React from "react";
import Head from "next/head";

import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from '../components/FollowList';

const profile = () => {

  const followingList = [
    { nickname: "홍길동"},
    { nickname: "김수한무"},
    { nickname: "거북이와두루미"},
  ];
  const followerList = [
    { nickname: "홍길동"},
    { nickname: "김수한무"},
    { nickname: "거북이와두루미"},
  ];
  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉 목록" data={followingList} />
        <FollowList header="팔로워 목록" data={followerList} />
      </AppLayout>
    </>
  );
};

export default profile;
