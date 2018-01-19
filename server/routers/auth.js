/**
 * 权限认证
 */

const Router = require('koa-router');
const router = new Router();
const User = require('../models/user');

/**
 * 未登录则强制跳转到 login 登录页面
 * 已登陆则不做处理，除非访问的是 login 登录页面，会跳转到主页
 */
router.get('/*', async function (ctx, next) {
  console.log(ctx.path);
  if (ctx.session.uid) {
    // session.uid存在则表明已经认证成功
    var loginState = true;
  } else {
    // session.uid不存在则判断cookie.uid是否合法，在数据库中查找uid
    if (ctx.cookies.get('uid')) {
      let uid = ctx.cookies.get('uid');
      let user = await User.findOne({ uid });

      if (user) {
        // cookie.uid 合法则将 uid,username,avator 写入session
        ctx.session.uid       = user.uid;
        ctx.session.username  = user.username;
        ctx.session.avatar    = user.avatar;

        var loginState = true;
      } else {
        // cookie.uid 非法
        var loginState = false;
      }
    } else {
      // session.uid 和 cookie.uid 都不存在表明未认证
      var loginState = false
    }
  }

  console.log(`loginState: ${loginState}`);

  if (loginState) {
    // 已经登录则跳转到主页/，但如果已经跳转到主页/则不在跳转，否则会出现重定向循环
    if (ctx.path === '/login') {
      await ctx.redirect('/');
    }
  } else {
    // 未登录则跳转到登录页面/login，但如果已经跳转到/login则不在跳转，否则会出现重定向循环
    if (ctx.path !== '/login') {
      await ctx.redirect('/login');
    }
  }
})



// api 请求认证
router.get('/api/*', async (ctx, next) => {
  if (ctx.session.uid) {
    // session.uid存在则表明已经认证成功
    var loginState = true;
  } else {
    // session.uid不存在则判断cookie.uid是否合法，在数据库中查找uid
    if (ctx.cookies.get('uid')) {
      let uid = ctx.cookies.get('uid');
      let user = await User.findOne({ uid });

      if (user) {
        // cookie.uid 合法则将 uid,username,avator 写入session
        ctx.session.uid       = user.uid;
        ctx.session.username  = user.username;
        ctx.session.avatar    = user.avatar;

        var loginState = true;
      } else {
        // cookie.uid 非法
        var loginState = false;
      }
    } else {
      // session.uid 和 cookie.uid 都不存在表明未认证
      var loginState = false;
    }
  }

  if (!loginState) {
    // 未认证返回错误提示
    var status = 401;
    var message = '未认证，请登录后重试';
    const body = { status, message };
    ctx.status = status;
    ctx.body = body;
  }
});

module.exports = router;
