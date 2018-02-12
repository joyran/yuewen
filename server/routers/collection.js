/**
 * 收藏文章路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Collection = require('../models/collection');
var User = require('../models/user');


/**
 * 收藏文章 和 取消收藏文章
 */
router.post('/api/v1/article/collection', async ctx => {
  const { aid } = ctx.request.body;
  const userObjectId = ctx.session.objectId;

  // 查找该篇文章是否被当前登录用户收藏
  var ret = await Collection.findOne({ article: aid, user: userObjectId });

  // 如果已经收藏过则取消收藏，反之添加收藏
  if (ret) {
    // 取消收藏
    await Collection.findByIdAndRemove(ret._id).exec();
    var hasCollected = false;
  } else {
    // 添加收藏
    var createAt = parseInt(Date.now()/1000);
    await Collection.create({ article: aid, user: userObjectId, createAt });
    var hasCollected = true
  }

  // 输出返回值
  ctx.status = 200;
  ctx.body = { hasCollected };
});

module.exports = router;
