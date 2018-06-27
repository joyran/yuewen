/**
 * 登录相关路由，包括登录，退出，读取
 */

var Router = require('koa-router');
var router = new Router();
var User = require('../models/user');

/**
 * 退出登录，删除 uid和 koa:sess cookie，删除所有session
 */
router.del('/api/v1/session', async ctx => {
  // 清空 session
  ctx.session = {};

  // 删除 uid和koa:sess cookie，设置 maxAge = 0实现
  ctx.cookies.set('uid', '', {
    maxAge: 0
  });
  ctx.cookies.set('koa:sess', '', {
    maxAge: 0
  });

  ctx.status = 204;
  ctx.body = {};
});


/**
 * 登录验证，登录对应的资源是session，登录为创建新的会话
 */
router.post('/api/v1/session', async ctx => {
  // 读取用户名，密码，是否记住我选项
  var { username , password, remember } = ctx.request.body;

  // 检测账号是否被锁定, 如果被锁定则不继续登录
  var user = await User.findOne({
                      state: false,
                      $or: [
                        { login: username },
                        { name:  username },
                        { mail:  username }
                    ]});

  if (user) {
    var message = '账号被禁用，请联系管理员';
    var status  = 401;
  } else {
    // password 和 username,email 中任何一个匹配成功则登录成功，反之登录失败
    var user = await User.findOne({
                        password: password,
                        $or: [
                          { login: username },
                          { name:  username },
                          { mail:  username }
                      ]});

    if (user) {
      // 登录成功
      var status  = 201;
      var message = '登录成功';

      // 登录成功则将 uid, username, avator, smAvatar 写入session
      ctx.session.username  = user.username;
      ctx.session.uid       = user._id;
      ctx.session.avatar    = user.avatar;
      ctx.session.smAvatar  = user.smAvatar;
      ctx.session.admin     = user.admin

      // 如果勾选“下次自动登录”，将 uid 写入到cookie中，生存时间1个月
      if (remember) {
        ctx.cookies.set('uid', user._id, {
          signed: true,
          maxAge: 1000*3600*24*30,
          httpOnly: true
        });
      }
    } else {
      // 登录失败
      var status  = 401;
      var message = '登录失败，用户名或者密码错误！';
    }
  }

  // 输出返回值
  ctx.status = status;
  ctx.body = { status, message };
});

module.exports = router;
