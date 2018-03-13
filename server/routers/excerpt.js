/**
 * 文章摘要路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Collection = require('../models/collection');
var User = require('../models/user');


/**
 * 根据文章标签 tag 读取文章摘录 excerpt
 */
router.get('/api/v1/excerpts/tag/:tag', async ctx => {
  const { tag } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  switch (tag) {
    case 'new':
      // tag 为 new 根据发布时间降序返回所有文章
      var excerpts = await Article.find({}).sort({ created_at: -1 }).populate('author').skip(skip).limit(per_page).lean();

      // 读取文章总数
      var total = await Article.count({});
      break;

    case 'hot':
      // tag 为 hot 根据热度 heat 降序排序
      var excerpts = await Article.find({}).sort({ heat: -1 }).populate('author').skip(skip).limit(per_page).lean();

      // 读取文章总数
      var total = await Article.count({});
      break;

    default:
      // 根据对应的标签 tag 查找
      var excerpts = await Article.find({ tags: tag }).sort({ created_at: -1 }).populate('author').skip(skip).limit(per_page).lean();

      // 读取文章总数
      var total = await Article.find({ tags: tag }).count({});
      break;
  }

  // 删除一些敏感信息和冗余字段
  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;

    // 删除 markdown
    delete excerpt.markdown;

    // 删除 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= total ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { has_more, excerpts };
});


/**
 * 读取用户发表的文章摘录集合 excerpts
 */
router.get('/api/v1/users/:user/excerpts/created', async ctx => {
  const { user } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  const result = await User.findOne({ login: user }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var excerpts = await Article.find({ author: result._id }).sort({ created_at: -1 })
                              .populate('author').skip(skip).limit(per_page).lean();
  var excerpts_created_count = await Article.find({ author: result._id }).count({});
  var excerpts_collected_count = await Collection.find({ user: result._id }).count({});

  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;

    // 删除 markdown
    delete excerpt.markdown;

    // 删除 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= excerpts_created_count ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { excerpts, excerpts_created_count, excerpts_collected_count, has_more };
});


/**
 * 读取用户发表的文章摘录集合 excerpts
 */
router.get('/api/v1/users/:user/excerpts/collected', async ctx => {
  const { user } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  const result = await User.findOne({ login: user }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 返回数组，格外为 [ { article: '5944f34301a2a6e76242147a' },{ article: '5944f2c501a2a6e762421466' } ]
  var collections = await Collection.find({ user: result._id }, { _id: 0, article: 1, by: 1 })
                                    .sort({ created_at: -1 }).skip(skip).limit(per_page).lean();

  // 返回 article id 组成的数组，[ '5944f34301a2a6e76242147a', '5944f2c501a2a6e762421466' ]
  var collections = collections.map((collection) => collection.article);

  // 读取摘要
  var excerpts = await Article.find({ _id: { $in: collections }}).populate('author').lean();
  var excerpts_collected_count = await Collection.find({ user: result._id }).count({});

  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;

    // 删除 markdown
    delete excerpt.markdown;

    // 删除 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= excerpts_collected_count ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { excerpts, excerpts_collected_count, has_more };
});

module.exports = router;
