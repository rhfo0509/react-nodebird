import { Avatar, Button, Card } from 'antd';
import React from 'react';

const UserProfile = ({ setIsLoggedIn }) => {
  const onLogout = () => {
    setIsLoggedIn(false);
  }
  return (
    <Card
      actions={[
        <div key="twit">짹짹<br />0</div>,
        <div key="followings">팔로잉<br />0</div>,
        <div key="followers">팔로워<br />0</div>
      ]}
    >
      <Card.Meta 
        avatar={<Avatar>ZC</Avatar>}
        title="BEAR"
      />
      <Button onClick={onLogout}>로그아웃</Button>
    </Card>
  );
};

export default UserProfile;