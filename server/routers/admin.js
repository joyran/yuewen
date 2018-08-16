/**
 * 后台管理
 */

const Router = require('koa-router');
const router = new Router();
const Article = require('../models/article');
const User = require('../models/user');
const Topic = require('../models/topic');
const jsonPretty = require('./json-pretty');


/**
 * 读取用户
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 100
 */
router.get('/api/v1/admin/users', async ctx => {
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 100;
  const skip = (page - 1) * per_page;
  const { has_view } = ctx.query;

  if (!ctx.session.admin) {
    jsonPretty(ctx, 403, { message: '没有权限' });
    return;
  }

  // 读取用户
  var users = await User.find({}).skip(skip).limit(per_page).lean();

  // 删除用户密码
  users.map((user) => {
    delete user.password;
  });

  // 读取用户总数量
  var total = await User.find({}).count();

  jsonPretty(ctx, 200, { data: users, total });
});


/**
 * 恢复用户登录密码为默认值
 * 方法: PUT
 */
router.put('/api/v1/admin/users/:login/reset_password', async ctx => {
  const { login } = ctx.params;

  if (!ctx.session.admin) {
    jsonPretty(ctx, 403, { message: '没有权限' });
    return;
  }

  var user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  // 恢复用户登录密码为默认值
  await User.findByIdAndUpdate({ _id: user._id }, { password: 'e10adc3949ba59abbe56e057f20f883e' }).exec();

  jsonPretty(ctx, 204, {});
});


/**
 * 新增用户
 * 方法: PUT
 * 返回值: 新增用户
 */
router.put('/api/v1/admin/users', async ctx => {
  const { login, name, mail } = ctx.request.body

  var user = await User.create({
    login,
    name,
    mail,
    password: 'e10adc3949ba59abbe56e057f20f883e',
    avatar_url: '/uploads/avatar/default.png',
    small_avatar_url: '/uploads/avatar/default.png',
    prestige: 0,
    banner_url: '/uploads/banner/default_banner.jpg',
    bio: null,
    state: true,
    admin: false,
    created_at: parseInt(Date.now()/1000),
    followers: [],
    following: [],
    followed_topics: []
  })

  delete user.password;

  jsonPretty(ctx, 200, user);
});


/**
 * 读取文章
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 100
 */
router.get('/api/v1/admin/articles', async ctx => {
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 100;
  const skip = (page - 1) * per_page;

  if (!ctx.session.admin) {
    jsonPretty(ctx, 403, { message: '没有权限' });
    return;
  }

  // 读取文章
  var articles = await Article.find({}).sort({ created_at: -1 }).skip(skip).limit(per_page).populate('author').lean();

  // 删除用户密码
  articles.map((article) => {
    article.author_login = article.author.login;
    article.author = article.author.name;
  });

  // 读取文章总数量
  var total = await Article.find({}).count();

  jsonPretty(ctx, 200, { data: articles, total });
});


/**
 * 删除文章
 * 方法: DELETE
 * 参数: aid，文章索引
 */
router.delete('/api/v1/admin/articles/:aid', async ctx => {
  const { aid } = ctx.params;

  if (!ctx.session.admin) {
    jsonPretty(ctx, 403, { message: '没有权限' });
    return;
  }

  await Article.remove({ _id: aid }).exec();

  // 输出返回值
  jsonPretty(ctx, 204, {});
});


/**
 * 读取话题
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 100
 */
router.get('/api/v1/admin/topics', async ctx => {
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 100;
  const skip = (page - 1) * per_page;

  if (!ctx.session.admin) {
    jsonPretty(ctx, 403, { message: '没有权限' });
    return;
  }

  // 读取话题
  var topics = await Topic.find({}).skip(skip).limit(per_page).lean();

  // 读取话题总数量
  var total = await Topic.find({}).count();

  jsonPretty(ctx, 200, { data: topics, total });
});


/**
 * 新增话题
 * 方法: PUT
 * 返回值: 新增话题
 */
router.put('/api/v1/admin/topics', async ctx => {
  var ret = await Topic.create({
    ...ctx.request.body,
    followers_count: 0,
    articles_count: 0
  })

  jsonPretty(ctx, 200, ret);
});


module.exports = router;
