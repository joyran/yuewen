/**
 * 用户
 */

var Router = require('koa-router');
var router = new Router();
var User = require('../models/user');

/**
 * 读取当前登录用户基本信息
 * 方法: GET
 * 参数: 无
 * 返回值： 用户基本信息
 */
router.get('/api/v1/user', async ctx => {
  if (!ctx.session.uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
  } else {
    var result = await User.findOne({ _id: ctx.session.uid }).lean();

    // 删除密码不返回
    delete result.password;
    ctx.status = 200;
    ctx.body = result;
  }
})

/**
 * 修改用户登录密码
 * 方法： PUT
 * 参数： oldpassword, 旧密码
 * 参数： newpassword, 新密码
 * 返回值： 成功返回空，失败返回错误消息
 */
router.put('/api/v1/user/password', async ctx => {
  const { oldpassword, newpassword } = ctx.request.body;
  const uid = ctx.session.uid;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
  }

  // 验证旧密码是否正确
  var result = await User.findOne({ _id: uid, password: oldpassword });
  if (!result) {
    ctx.status = 401;
    ctx.body = { message: '旧密码不正确' };
  } else {
    // 旧密码正确则修改密码
    var result = await User.findByIdAndUpdate({ _id: uid }, { password: newpassword }).exec();
    if (result) {
      ctx.status = 201;
      ctx.body = {};
    } else {
      ctx.status = 500;
      ctx.body = { message: '服务器错误' };
    }
  }

});

module.exports = router;
