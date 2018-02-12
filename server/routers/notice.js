/**
 * 消息通知
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Like = require('../models/like');
var User = require('../models/user');
var Notice = require('../models/notice');


/**
 * 读取所有消息通知，包括评论和点赞
 */
router.get('/api/v1/notice', async ctx => {
  const state = ctx.query.state;
  // 当前登录用户 id
  const userObjectId = ctx.session.objectId;

  // 获取所有通知消息，包括点赞和评论 ，已读和未读
  var notices = await Notice.find({ at: userObjectId }).sort({'createAt': -1}).populate('initiator').lean();

  notices.map((notice) => {
    notice.initiatorAvatar = notice.initiator.avatar;
    notice.initiatorId = notice.initiator._id;
    notice.initiator = notice.initiator.username;
  });

  ctx.status = 200;
  ctx.body = notices
});


/**
 * 读取所有未读消息通知，包括评论和点赞
 */
router.get('/api/v1/notice/unview', async ctx => {
  const state = ctx.query.state;
  // 当前登录用户 id
  const userObjectId = ctx.session.objectId;

  // 获取未读评论消息
  var unviewComments = await  Notice.find({ at: userObjectId, hasView: false, type: 'comment' })
                                    .sort({'createAt': -1}).populate('initiator').lean();

  unviewComments.map((unviewComment) => {
    unviewComment.initiatorAvatar = unviewComment.initiator.avatar;
    unviewComment.initiatorId = unviewComment.initiator._id;
    unviewComment.initiator = unviewComment.initiator.username;
  });

  // 获取未读点赞消息
  var unviewLikes = await Notice.find({ at: userObjectId, hasView: false, type: 'like' })
                                .sort({'createAt': -1}).populate('initiator').lean();

  unviewLikes.map((unviewLike) => {
    unviewLike.initiatorAvatar = unviewLike.initiator.avatar;
    unviewLike.initiatorId = unviewLike.initiator._id;
    unviewLike.initiator = unviewLike.initiator.username;
  });

  // 未读评论通知数量
  var unviewCommentsCount = unviewComments.length;
  // 未读点赞通知数量
  var unviewLikesCount = unviewLikes.length;
  // 所有未读通知数量
  var unviewAllCount = unviewCommentsCount + unviewLikesCount;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { unviewComments, unviewLikes, unviewCommentsCount, unviewLikesCount, unviewAllCount };
});


/**
 * 更新通知消息状态为已读
 * @param nid 通知 id，如果 nid 为 0表示所有
 */
router.post('/api/v1/notice/toview', async ctx => {
  const { nid, type } = ctx.request.body;
  // 当前登录用户 id
  const userObjectId = ctx.session.objectId;

  if (nid == 0) {
    // 清空所有通知，修改 hasView 为 true
    await Notice.update({ at: userObjectId, hasView: false, type }, { hasView: true }, { multi: true }).exec();
  } else {
    // 修改单条通知状态为已读
    await Notice.update({ _id: nid, at: userObjectId, hasView: false, type }, { hasView: true }).exec();
  }

  ctx.status = 200;
  ctx.body = {};
});


module.exports = router;
