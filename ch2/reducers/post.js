export const initialState = {
  mainPosts: [
    {
      id: 1,
      User: {
        id: 1,
        nickname: "zero",
      },
      content: "첫 번째 게시글 #해시태그 #익스프레스",
      Images: [
        {
          src: "https://bookthumb-phinf.pstatic.net/cover/137/995/13799585.jpg?udate=20180726",
        },

        {
          src: "http://gimg.gilbut.co.kr/book/BN001958/rn_view_BN001958.jpg",
        },

        {
          src: "https://gimg.gilbut.co.kr/book/BN001998/rn_view_BN001998.jpg",
        },
      ],
      Comments: [
        {
          User: { nickname: "nero" },
          content: "우와 개정판이 나왔군요~",
        },
        {
          User: { nickname: "hero" },
          content: "얼른 사고 싶어요!",
        },
      ],
    },
  ],
  imagePaths: [], // 이미지 업로드 시 이미지 경로 저장
  postAdded: false, // 게시글 추가가 완료되었을 때 true
};

const dummyPost = {
  id: 2,
  User: {
    id: 1,
    nickname: "zero",
  },
  content: "더미데이터입니다.",
  Images: [],
  Comments: [],
};

const ADD_POST = "ADD_POST";
export const addPost = {
  type: ADD_POST,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST:
      return {
        ...state,
        mainPosts: [dummyPost, ...state.mainPosts],
        postAdded: true,
      }
    default:
      return state;
  }
};

export default reducer;
