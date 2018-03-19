var Router = require('koa-router');
var router = new Router();
var Topic = require('../models/topic');
var Article = require('../models/article');
var User = require('../models/user');

/**
 * 读取所有话题
 */
router.get('/api/v1/topics', async ctx => {
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var user = await User.findOne({ _id: uid }).lean();

  // 读取所有话题, 按照文章数量降序排序
  var topics = await Topic.find({}).sort({ articles: -1 }).skip(skip).limit(per_page).lean();

  // 话题总数
  var total = await Topic.find({}).count({});

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= total ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { data: topics, has_more };
});


/**
 * 读取话题基本信息
 */
router.get('/api/v1/topic/:topic', async ctx => {
  const { topic } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var result = await Topic.findOne({ topic }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var user = await User.findOne({ _id: uid, followed_topics: topic });
  result.has_followed = user ? true : false;

  result.articles_url = `/api/v1/topic/${topic}/articles`;
  result.followers_url = `/api/v1/topic/${topic}/followers`;

  // 输出返回值
  ctx.status = 200;
  ctx.body = result;
});


/**
 * 读取话题文章
 */
router.get('/api/v1/topic/:topic/articles', async ctx => {
  const { topic } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const sort_by = ctx.query.sort_by ? ctx.query.sort_by : 'time';
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var result = await Topic.findOne({ topic }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 根据对应的话题查找
  switch (sort_by) {
    case 'time':
      // 根据发布时间排序
      var articles = await Article.find({ topics: topic }).sort({ created_at: -1 })
                                  .populate('author').skip(skip).limit(per_page).lean();
      break;

    case 'heat':
      // 根据热度排序
      var articles = await Article.find({ topics: topic }).sort({ heat: -1 })
                                  .populate('author').skip(skip).limit(per_page).lean();
      break;

    default:
      break;
  }


  // 话题文章总数量
  var total = await Article.find({ topics: topic }).count({});

  // 删除一些敏感信息和冗余字段
  articles.map((article) => {
    // 删除用户密码
    delete article.author.password;
    // 删除文章 markdown
    delete article.markdown;
    // 删除文章 html
    delete article.html;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= total ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { has_more, data: articles };
});


/**
 * 读取话题关注者
 */
router.get('/api/v1/topic/:topic/followers', async ctx => {
  const { topic } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var result = await Topic.findOne({ topic }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 话题关注者
  var users = await User.find({ followed_topics: topic }).sort({ created_at: -1 })
                              .populate('author').skip(skip).limit(per_page).lean();

  // 话题关注者数量
  var total = await User.find({ followed_topics: topic }).count({});

  users.map((user) => {
    // 删除用户密码
    delete user.password;
  });

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page >= total ? false : true;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { has_more, data: users };
});


/**
 * 关注话题
 */
router.put('/api/v1/topic/:topic/follow', async ctx => {
  const { topic } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var result = await Topic.findOne({ topic }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 话题关注者数量
  var followers_count = result.followers_count;

  var user = await User.findOne({ _id: uid });

  // 检查用户是否已经关注过改话题, 如果已经关注过则不做任何操作
  var result = await User.findOne({ _id: uid, followed_topics: topic }).lean();
  if (result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 关注话题
  var user = await User.findByIdAndUpdate({ _id: uid }, { followed_topics: user.followed_topics.concat([topic]) }).exec();

  // 话题关注者数量加 1
  var followers_count = followers_count + 1;
  await Topic.update({ topic }, { followers_count }).exec();

  const has_followed = true;


  // 输出返回值
  ctx.status = 200;
  ctx.body = { has_followed, followers_count };
});


/**
 * 取消关注话题
 */
router.delete('/api/v1/topic/:topic/follow', async ctx => {
  const { topic } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var result = await Topic.findOne({ topic }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var user = await User.findOne({ _id: uid });

  // 取消关注话题
  var followed_topics = user.followed_topics;
  var index = followed_topics.indexOf(topic);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 从用户关注的话题列表中删除当前话题
  followed_topics.splice(index, 1);
  var user = await User.findByIdAndUpdate({ _id: uid }, { followed_topics }).exec();

  // 话题关注者数量减 1
  const followers_count = result.followers_count - 1;
  await Topic.update({ topic }, { followers_count }).exec();

  const has_followed = false;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { has_followed, followers_count };
});


module.exports = router;
