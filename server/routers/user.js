/**
 * 用户
 */

var Router = require('koa-router');
var router = new Router();
var User = require('../models/user');
var Article = require('../models/article');

/**
 * 读取当前登录用户基本信息
 * 方法: GET
 * 参数: 无
 * 返回值: 用户基本信息
 */
router.get('/api/v1/user', async ctx => {
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var user = await User.findOne({ _id: uid }).lean();

  if (!user) {
    ctx.status = 404;
    ctx.body = { 'message': 'Not Found' };
    return;
  }

  // 删除用户密码
  delete user.password;

  // 用户接收的通知消息 url
  user.received_notices_url = `/api/v1/users/${user.login}/received_notices`;

  // 用户发表的文章总数量
  const articles_count = await Article.find({ author: uid }).count({});
  user.articles_count = articles_count;

  ctx.status = 200;
  ctx.body = user;
});

/**
 * 读取所有用户
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 10
 * 返回值: 用户基本信息数组
 */
router.get('/api/v1/users', async ctx => {
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var users = await User.find({}).sort({ created_at: -1 }).skip(skip).limit(per_page).lean();
  users.map((user) => {
    delete user.password;
    user.received_notices_url = `/api/v1/users/${user.login}/received_notices`;
    user.url = `/api/v1/users/${user.login}`;
  });

  ctx.status = 200;
  ctx.body = users;
});

/**
 * 读取指定用户
 * 方法: GET
 * 参数: user, 用户登录唯一标识
 * 返回值: 用户基本信息
 */
router.get('/api/v1/users/:login', async ctx => {
  const { login } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var user = await User.findOne({ login }).lean();
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: '未找到指定用户' };
    return;
  }

  delete user.password;
  user.received_notices_url = `/api/v1/users/${login}/received_notices`;
  user.url = `/api/v1/users/${login}`;

  ctx.status = 200;
  ctx.body = user;
});


/**
 * 读取用户所有发表的文章
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 10
 */
router.get('/api/v1/users/:login/articles', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var user = await User.findOne({ login }).lean();
  var articles = await Article.find({ author: user._id }).sort({ created_at: -1 })
                              .skip(skip).limit(per_page).populate('author').lean();
  articles.map((article) => {
    delete article.author.password;

    // 文章评论 url
    article.comments_url = `/api/v1/articles/${article._id}/comments`;

    // 文章点赞用户 url
    article.likes_url = `/api/v1/articles/${article._id}/likes`;
  })

  ctx.status = 200;
  ctx.body = articles;
});


/**
 * 读取用户发表的指定文章
 * 方法: GET
 */
router.get('/api/v1/users/:login/articles/:aid', async ctx => {
  const { uid } = ctx.session;
  const { login, aid } = ctx.params;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var user = await User.findOne({ login }).lean();
  var article = await Article.findOne({ author: user._id, _id: aid }).lean();

  if (!article) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  delete article.author.password;

  // 文章评论 url
  article.comments_url = `/api/v1/articles/${article._id}/comments`;

  // 文章点赞用户 url
  article.likes_url = `/api/v1/articles/${article._id}/likes`;

  ctx.status = 200;
  ctx.body = article;
});


/**
 * 修改用户登录密码
 * 方法： PUT
 * 参数： oldpassword, 旧密码
 * 参数： newpassword, 新密码
 * 返回值： 成功返回空，失败返回错误消息
 */
router.put('/api/v1/user/password', async ctx => {
  const { oldpassword, newpassword } = ctx.request.body;
  const { uid } = ctx.session;

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
