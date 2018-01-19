/**
 * 文章摘要路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');


/**
 * 读取摘要列表
 */
router.get('/api/v1/digests', async ctx => {
  const skip  = ctx.query.skip ? parseInt(ctx.query.skip) : 0;
  const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
  const tag   = ctx.query.tag ? ctx.query.tag : null;

  // 根据 skip 和 limit 返回摘要列表, 按发表时间降序排列
  // mongoose find 查询返回的结果默认不可以修改，除非用 .lean() 查询。
  // 或者用.toObject()转换成 objcet对象
  if (!tag) {
    // tag 为 null 时不根据 tag 查找, 返回所有
    var digests = await Article.find({}).sort({'createAt': -1}).populate('author').lean().skip(skip).limit(limit);
  } else if (tag === 'hot') {
    // tag 为 hot 根据热度 heat 排序
    var digests = await Article.find({}).sort({'heat': -1}).populate('author').lean().skip(skip).limit(limit);
  } else {
    // 根据对应的标签 tag 查找
    var digests = await Article.find({'tags': tag}).sort({'createAt': -1}).populate('author').lean().skip(skip).limit(limit);
  }

  digests.map((digest) => {
    // 文章作者头像
    digest.authorAvatar = digest.author.avatar;
    // 文章作者 id
    digest.authorId = digest.author._id;
    // 文章作者
    digest.authorName = digest.author.username;
    // 文章索引 aid
    digest.aid = digest._id;
    // 删除 markdown, markup, user
    delete digest.markdown;
    // delete digest.markup;
    delete digest.author;
  });

  // 读取文章总数
  const total = await Article.count({});

  // 是否到底了
  const isEnd = skip + limit >= total ? true : false;

  const status = 200;

  // 输出返回值
  const body = { status, total, isEnd, digests };
  ctx.status = status;
  ctx.body = body;
});

module.exports = router;
