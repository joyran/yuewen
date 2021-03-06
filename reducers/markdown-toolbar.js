import { createActions, handleActions } from 'redux-actions';

// ------------------------
// ACTIONS
// ------------------------
export const {
  toggleAddImgModal,
  toggleAddLinkModal,
  toggleAddTableModal,
  toggleReleaseArticleModal
} = createActions(
  'TOGGLE_ADD_IMG_MODAL',
  'TOGGLE_ADD_LINK_MODAL',
  'TOGGLE_ADD_TABLE_MODAL',
  'TOGGLE_RELEASE_ARTICLE_MODAL'
);

// ------------------------
// REDUCERS
// ------------------------
export const mtoolbar = handleActions({
  TOGGLE_ADD_IMG_MODAL: state => ({
    ...state,
    addImgModalVisible: !state.addImgModalVisible
  }),

  TOGGLE_ADD_LINK_MODAL: state => ({
    ...state,
    addLinkModalVisible: !state.addLinkModalVisible
  }),

  TOGGLE_ADD_TABLE_MODAL: state => ({
    ...state,
    addTableModalVisible: !state.addTableModalVisible
  }),

  TOGGLE_RELEASE_ARTICLE_MODAL: state => ({
    ...state,
    releaseArticleModalVisible: !state.releaseArticleModalVisible
  })
}, {});
