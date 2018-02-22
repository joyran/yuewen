/**
 * 搜索路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');

/**
 * 读取当前登录用户基本信息
 */
router.get('/api/v1/search/:keyword', async ctx => {
  const keyword = ctx.params.keyword;
  var articles = await Article.find({ $text: {$search: keyword }});
  console.log(articles);

  // 输出返回值
  ctx.status = 200;
  ctx.body = articles;
});

module.exports = router;
