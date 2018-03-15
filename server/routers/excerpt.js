/**
 * 文章摘要路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Collection = require('../models/collection');
var User = require('../models/user');


/**
 * 读取用户关注的话题文章集合 excerpts
 */
router.get('/api/v1/users/:login/excerpts/follow', async ctx => {
  const { login } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var user = await User.findOne({ login }).lean();
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var excerpts = await Article.find({ topics: { $in: user.followed_topics }})
                              .sort({ created_at: -1 }).populate('author')
                              .skip(skip).limit(per_page).lean();

  // 读取文章总数
  var total = await Article.find({ topics: { $in: user.followed_topics }}).count({});

  // 删除一些敏感信息和冗余字段
  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;
    // 删除文章 markdown
    delete excerpt.markdown;
    // 删除文章 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= total ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { data: excerpts, has_more };
});


/**
 * 读取用户发表的文章摘录集合 excerpts
 */
router.get('/api/v1/users/:login/excerpts/create', async ctx => {
  const { login } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  const user = await User.findOne({ login }).lean();
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var excerpts = await Article.find({ author: user._id }).sort({ created_at: -1 })
                              .populate('author').skip(skip).limit(per_page).lean();
  var excerpts_created_count = await Article.find({ author: user._id }).count({});
  var excerpts_collected_count = await Collection.find({ user: user._id }).count({});

  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;
    // 删除文章 markdown
    delete excerpt.markdown;
    // 删除文章 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= excerpts_created_count ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { data: excerpts, excerpts_created_count, excerpts_collected_count, has_more };
});


/**
 * 读取用户发表的文章摘录集合 excerpts
 */
router.get('/api/v1/users/:login/excerpts/collect', async ctx => {
  const { login } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  const user = await User.findOne({ login }).lean();
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 返回数组，格外为 [ { article: '5944f34301a2a6e76242147a' },{ article: '5944f2c501a2a6e762421466' } ]
  var collections = await Collection.find({ user: user._id }, { _id: 0, article: 1, by: 1 })
                                    .sort({ created_at: -1 }).skip(skip).limit(per_page).lean();

  // 返回 article id 组成的数组，[ '5944f34301a2a6e76242147a', '5944f2c501a2a6e762421466' ]
  var collections = collections.map((collection) => collection.article);

  // 读取摘要
  var excerpts = await Article.find({ _id: { $in: collections }}).populate('author').lean();
  var excerpts_collected_count = await Collection.find({ user: user._id }).count({});

  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;
    // 删除文章 markdown
    delete excerpt.markdown;
    // 删除文章 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= excerpts_collected_count ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { data: excerpts, excerpts_collected_count, has_more };
});

module.exports = router;
