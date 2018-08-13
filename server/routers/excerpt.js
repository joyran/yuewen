/**
 * 文章摘要路由
 */

const Router = require('koa-router');
const router = new Router();
const Article = require('../models/article');
const Collection = require('../models/collection');
const User = require('../models/user');
const jsonPretty = require('./json-pretty');


/**
 * 读取用户关注的话题文章集合 excerpts
 */
router.get('/api/v1/users/:login/excerpts/follow', async ctx => {
  const { login } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  const user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  // 包括关注的话题和关注的用户发表的文章
  var excerpts = await Article.find({ $or: [
                                      { topics: { $in: user.followed_topics }},
                                      { author: { $in: user.following }}
                                    ]})
                              .sort({ created_at: -1 }).populate('author')
                              .skip(skip).limit(per_page).lean();

  // 读取文章总数
  var total = await Article.find({ $or: [
                                      { topics: { $in: user.followed_topics }},
                                      { author: { $in: user.following }}
                                    ]}).count({});

  // 如果用户没有关注话题和文章，则展示热门文章
  if (total === 0) {
    var excerpts = await Article.find({}).sort({ heat: -1 }).populate('author').skip(skip).limit(per_page).lean();
    var total = await Article.find({}).count({});
  }


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
  const has_more = skip + per_page < total;

  // 输出返回值
  jsonPretty(ctx, 200, { data: excerpts, has_more, total });
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

  const user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  var excerpts = await Article.find({ author: user._id }).sort({ created_at: -1 })
                              .populate('author').skip(skip).limit(per_page).lean();
  var excerpts_count = await Article.find({ author: user._id }).count({});

  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;
    // 删除文章 markdown
    delete excerpt.markdown;
    // 删除文章 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page < excerpts_count;

  // 输出返回值
  jsonPretty(ctx, 200, { data: excerpts, has_more });
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

  const user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  // 返回数组，格外为 [ { article: '5944f34301a2a6e76242147a' },{ article: '5944f2c501a2a6e762421466' } ]
  var collections = await Collection.find({ user: user._id }, { _id: 0, article: 1, by: 1 })
                                    .sort({ created_at: -1 }).skip(skip).limit(per_page).lean();

  // 返回 article id 组成的数组，[ '5944f34301a2a6e76242147a', '5944f2c501a2a6e762421466' ]
  var collections = collections.map((collection) => collection.article);

  // 读取摘要
  var excerpts = await Article.find({ _id: { $in: collections }}).populate('author').lean();
  var excerpts_count = await Collection.find({ user: user._id }).count({});

  excerpts.map((excerpt) => {
    // 删除用户密码
    delete excerpt.author.password;
    // 删除文章 markdown
    delete excerpt.markdown;
    // 删除文章 html
    delete excerpt.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page < excerpts_count;

  // 输出返回值
  jsonPretty(ctx, 200, { data: excerpts, has_more });
});

module.exports = router;
