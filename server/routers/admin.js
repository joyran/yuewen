/**
 * 后台管理
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Like = require('../models/like');
var User = require('../models/user');
var Notice = require('../models/notice');


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

  if (!ctx.session.uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (!ctx.session.admin) {
    ctx.status = 403;
    ctx.body = { message: '没有权限' };
    return;
  }

  // 读取用户
  var users = await User.find({}).skip(skip).limit(per_page).lean();
  // 删除用户密码
  users.map((user) => {
    delete user.password;
  });

  // 读取用户总数量
  var count = await User.find({}).count();

  ctx.status = 200;
  ctx.body = {
    status: 200,
    data: users,
    count
  }
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
  const { has_view } = ctx.query;

  if (!ctx.session.uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (!ctx.session.admin) {
    ctx.status = 403;
    ctx.body = { message: '没有权限' };
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
  var count = await Article.find({}).count();

  ctx.status = 200;
  ctx.body = {
    status: 200,
    data: articles,
    count
  }
});

module.exports = router;
