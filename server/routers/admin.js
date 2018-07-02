/**
 * 后台管理
 */

const Router = require('koa-router');
const router = new Router();
const Article = require('../models/article');
const Like = require('../models/like');
const User = require('../models/user');
const Notice = require('../models/notice');
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

module.exports = router;
