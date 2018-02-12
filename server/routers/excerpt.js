/**
 * 文章摘要路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Collection = require('../models/collection');


/**
 * 根据文章标签 tag 读取文章摘录 excerpt
 */
router.get('/api/v1/excerpts/tag/:tag', async ctx => {
  const skip  = ctx.query.skip ? parseInt(ctx.query.skip) : 0;
  const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
  const tag   = ctx.params.tag ? ctx.params.tag : 'new';

  // 根据 skip 和 limit 返回摘要列表, 按发表时间降序排列
  // mongoose find 查询返回的结果默认不可以修改，除非用 .lean() 查询。或者用.toObject()转换成 objcet对象
  switch (tag) {
    case 'new':
      // tag 为 new 根据发布时间降序返回所有文章
      var excerpts = await Article.find({}).sort({createAt: -1}).populate('author').lean().skip(skip).limit(limit);
      // 读取文章总数
      var total = await Article.count({});
      break;

    case 'hot':
      // tag 为 hot 根据热度 heat 降序排序
      var excerpts = await Article.find({}).sort({heat: -1}).populate('author').lean().skip(skip).limit(limit);
      // 读取文章总数
      var total = await Article.count({});
      break;

    default:
      // 根据对应的标签 tag 查找
      var excerpts = await Article.find({tags: tag}).sort({createAt: -1}).populate('author').lean().skip(skip).limit(limit);
      // 读取文章总数
      var total = await Article.find({tags: tag}).count({});
      break;
  }

  // 删除一些敏感信息和冗余字段
  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;
    // 删除 markdown
    delete excerpt.markdown;
    // 删除 markup
    delete excerpt.markup;
  });

  // 检测是否还有更多，总数小于 skip+limit 则没有更多了。
  const hasMore = skip + limit >= total ? false : true;

  // 输出返回值
  const body = { total, hasMore, dataSource: excerpts };
  ctx.status = 200;
  ctx.body = body;
});


/**
 * 根据用户 id 读取文章摘录 excerpt
 * @param sortby created 用户创建的， collected 用户收藏的
 */
router.get('/api/v1/excerpts/user/:uid', async ctx => {
  const skip   = ctx.query.skip ? parseInt(ctx.query.skip) : 0;
  const limit  = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
  const sortby = ctx.query.sortby;
  const uid    = ctx.params.uid;

  switch (sortby) {
    case 'created':
      var excerpts = await Article.find({author: uid}).sort({createAt: -1}).populate('author').lean().skip(skip).limit(limit);
      var total = await Article.find({author: uid}).count({});
      break;

    case 'collected':
      // 返回数组，格外为 [ { article: '5944f34301a2a6e76242147a' },{ article: '5944f2c501a2a6e762421466' } ]
      var collections = await Collection.find({user: uid}, {_id: 0,article: 1,by: 1}).sort({createAt: -1}).lean().skip(skip).limit(limit);
      // 返回 article id 组成的数组，[ '5944f34301a2a6e76242147a', '5944f2c501a2a6e762421466' ]
      var collecteArticles = collections.map((collection) => collection.article);
      // 返回摘要
      var excerpts = await Article.find({_id: {$in: collecteArticles}}).populate('author').lean();
      var total = await Collection.find({user: uid}).count({});
      break;
  }

  // console.log(excerpts);

  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;
    // 删除 markdown
    delete excerpt.markdown;
    // 删除 markup
    delete excerpt.markup;
  });

  // 检测是否还有更多，总数小于 skip+limit 则没有更多了。
  const hasMore = skip + limit >= total ? false : true;

  // 输出返回值
  const body = { total, hasMore, dataSource: excerpts };
  ctx.status = 200;
  ctx.body = body;
});

module.exports = router;
