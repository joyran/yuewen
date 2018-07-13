import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { message } from 'antd';
import fetch from 'isomorphic-fetch';
import { session } from './session';
import { notice } from './notice';
import { excerpt } from './excerpt';

const networkErrorMsg = '网络连接失败，请刷新重试！';

// ------------------------
// ACTIONS
// ------------------------
export const {
  readProfileSuccess,
  readFollowersSuccess,
  readFollowingSuccess,
  readArticlesSuccess,
  readCollectsSuccess,
  showArticlesLoadingCard,
  showCollectsLoadingCard
} = createActions(
  'READ_PROFILE_SUCCESS',
  'READ_FOLLOWERS_SUCCESS',
  'READ_FOLLOWING_SUCCESS',
  'READ_ARTICLES_SUCCESS',
  'READ_COLLECTS_SUCCESS',
  'SHOW_ARTICLES_LOADING_CARD',
  'SHOW_COLLECTS_LOADING_CARD'
);

/**
 * 裁剪头像
 */
export const cropAvatar = (width, height, x, y, filename) => () => {
  return fetch('/api/v1/upload/avatar/crop', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ width, height, x, y, filename })
  })
    .then(res => res.json())
    .then(() => {
      // 刷新页面
      location.reload();
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 裁剪封面图 banner
 */
export const cropBanner = (width, height, x, y, filename) => () => {
  return fetch('/api/v1/upload/banner/crop', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ width, height, x, y, filename })
  })
    .then(res => res.json())
    .then(() => {
      // 刷新页面
      location.reload();
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 删除文章封面图
 */
export const deleteBanner = filepath => () => {
  return fetch('/api/v1/upload/banner', {
    credentials: 'include',
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filepath })
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 读取关注当前登录用户的用户
 */
export const readFollowers = login => (dispatch, getState) => {
  const { page, per_page } = getState().profile.followers;

  return fetch(`/api/v1/users/${login}/followers?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readFollowersSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};


/**
 * 读取当前登录用户关注的用户
 */
export const readFollowing = login => (dispatch, getState) => {
  const { page, per_page } = getState().profile.following;

  return fetch(`/api/v1/users/${login}/following?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readFollowingSuccess(res));
    })
    .catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg, 5);
    });
};

/**
 * 读取用户发表的文章
 */
export const readArticles = login => (dispatch, getState) => {
  const { page, per_page } = getState().profile.articles;
  dispatch(showArticlesLoadingCard());

  return fetch(`/api/v1/users/${login}/excerpts/create?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get'
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readArticlesSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};


/**
 * 读取用户收藏的文章
 */
export const readCollects = login => (dispatch, getState) => {
  const { page, per_page } = getState().profile.collects;
  dispatch(showCollectsLoadingCard());

  return fetch(`/api/v1/users/${login}/excerpts/collect?page=${page}&per_page=${per_page}`, {
    credentials: 'include',
    method: 'get'
  })
    .then(res => res.json())
    .then((res) => {
      dispatch(readCollectsSuccess(res));
    }).catch((err) => {
      console.error(err.message);
      message.error(networkErrorMsg);
    });
};

// ------------------------
// REDUCERS
// ------------------------
export const profile = handleActions({
  READ_PROFILE_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload
  }),

  READ_FOLLOWERS_SUCCESS: (state, action) => ({
    ...state,
    followers: {
      ...state.followers,
      has_more: action.payload.has_more,
      data: state.followers.data.concat(action.payload.data),
      page: state.followers.page + 1,
      loading: false
    }
  }),

  READ_FOLLOWING_SUCCESS: (state, action) => ({
    ...state,
    following: {
      ...state.following,
      has_more: action.payload.has_more,
      data: state.following.data.concat(action.payload.data),
      page: state.following.page + 1,
      loading: false
    }
  }),

  READ_ARTICLES_SUCCESS: (state, action) => ({
    ...state,
    articles: {
      ...state.articles,
      has_more: action.payload.has_more,
      data: state.articles.data.concat(action.payload.data),
      page: state.articles.page + 1,
      loading: false
    }
  }),

  READ_COLLECTS_SUCCESS: (state, action) => ({
    ...state,
    collects: {
      ...state.collects,
      has_more: action.payload.has_more,
      data: state.collects.data.concat(action.payload.data),
      page: state.collects.page + 1,
      loading: false
    }
  }),

  SHOW_ARTICLES_LOADING_CARD: state => ({
    ...state,
    articles: {
      ...state.articles,
      loading: true
    }
  }),

  SHOW_COLLECTS_LOADING_CARD: state => ({
    ...state,
    collects: {
      ...state.collects,
      loading: true
    }
  })
}, {});

export const reducers = combineReducers({ session, profile, notice, excerpt });
