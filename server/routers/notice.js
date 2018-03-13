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
 * 读取用户接收到的所有通知消息，包括评论和点赞
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 100
 * 参数: has_view, true 或者 false
 */
router.get('/api/v1/users/:login/received_notices', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 100;
  const skip = (page - 1) * per_page;
  const { has_view } = ctx.query;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var user = await User.findOne({ login }).lean();
  if (has_view === 'true' || has_view === 'false') {
    var notices = await Notice.find({ atuser: user._id, has_view }).sort({ created_at: -1 })
                              .skip(skip).limit(per_page).populate('initiator').lean();
  } else {
    var notices = await Notice.find({ atuser: user._id }).sort({ created_at: -1 })
                              .skip(skip).limit(per_page).populate('initiator').lean();
  }

  notices.map((notice) => {
    // 删除不必要显示的敏感信息
    delete notice.initiator.password;
  });

  ctx.status = 200;
  ctx.body = notices
});


/**
 * 更新通知消息状态为已读
 * 方法: PUT
 * 参数: nid 通知 id，如果 nid 为 0表示所有
 * 参数: type 类型，如 comment, like
 */
router.put('/api/v1/users/:login/received_notices/:nid/toview', async ctx => {
  const { uid } = ctx.session;
  const { login, nid } = ctx.params;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  // 修改单条通知状态为已读, 修改 has_view 为 true
  var notice = await Notice.update({ _id: nid, atuser: uid, has_view: false }, { has_view: true }).exec();
  if (notice) {
    ctx.status = 201;
    ctx.body = { notice };
  } else {
    ctx.status = 404;
    ctx.body = { message: '未找到指定记录' };
  }
});

/**
 * 更新所有通知消息状态为已读
 * 方法: PUT
 * 参数: type 类型，如 comment, like
 */
router.put('/api/v1/users/:login/received_notices/toview', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  // 更新所有通知消息状态为已读，
  var notices = await Notice.update({ atuser: uid, has_view: false }, { has_view: true }, { multi: true }).exec();
  if (notices) {
    ctx.status = 201;
    ctx.body = { notices };
  } else {
    ctx.status = 404;
    ctx.body = { message: '未找到指定记录' };
  }
});


module.exports = router;
