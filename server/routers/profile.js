/**
 * 个人主页路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var User = require('../models/user');


/**
 * 读取用户个人基本信息
 */
router.get('/api/v1/profile', async ctx => {
  const { uid } = ctx.query;
  var user = await User.findOne({ _id: uid }).lean();
  delete user.password;

  // 输出返回值
  ctx.status = 200;
  ctx.body = user;
});


/**
 * 读取用户发表的所有文章
 */
router.get('/api/v1/profile/articles', async ctx => {
  const { uid } = ctx.query;

  const articles = await Article.find({ author: uid }).sort({created_at: -1}).populate('author').lean();
  delete articles.author.password;

  // 输出返回值
  ctx.status = 200;
  ctx.body = articles;
});

module.exports = router;
