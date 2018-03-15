var Router = require('koa-router');
var router = new Router();
var Topic = require('../models/topic');

/**
 * 读取所有话题
 */
router.get('/api/v1/topics', async ctx => {
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  // 读取所有话题, 按照文章数量降序排序
  var topics = await Topic.find({}).sort({ articles: -1 }).skip(skip).limit(per_page);

  // 输出返回值
  ctx.status = 200;
  ctx.body = topics;
});


/**
 * 根据文章话题读取文章摘录 excerpts
 */
router.get('/api/v1/topic/:topic/excerpts', async ctx => {
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

  var result = await Topic.find({ topic }).lean();
  if (!result) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 根据对应的话题查找
  var excerpts = await Article.find({ topics: topic }).sort({ created_at: -1 })
                              .populate('author').skip(skip).limit(per_page).lean();

  // 读取文章总数

  var total = result.articles_count;

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
  ctx.body = { has_more, excerpts };
});


module.exports = router;
