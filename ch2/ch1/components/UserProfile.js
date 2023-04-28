import { Avatar, Button, Card } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';

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
        avatar={<Avatar>z</Avatar>}
        title="zero"
      />
      <Button onClick={onLogout}>로그아웃</Button>
    </Card>
  );
};

UserProfile.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
};

export default UserProfile;