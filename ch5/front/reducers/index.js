import { HYDRATE } from "next-redux-wrapper";
import { combineReducers } from "redux";

import user from "./user";
import post from "./post";

const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log("HYDRATE", action);
      console.log("state:", state, "action:", action);

      return action.payload;
    default: {
      const combinedReducer = combineReducers({
        user,
        post,
      });
      console.log("state:", state, "action:", action);
      return combinedReducer(state, action);
    }
  }
};

export default rootReducer;
