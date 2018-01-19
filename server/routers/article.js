/**
 * 文章路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Like = require('../models/like');
var Tag = require('../models/tag');


/**
 * 根据文章索引 id 读取文章作者，标题，内容, 点赞人
 */
router.get('/api/v1/article', async ctx => {
  // 文章索引 id
  const aid = ctx.query.aid;

  // mongoose find 查询返回的结果默认不可以修改，除非用 .lean() 查询。
  // 或者用.toObject()转换成 objcet对象
  var article = await Article.findOne({ _id: aid }).populate('author').lean();

  // 文章作者头像
  article.authorAvatar = article.author.avatar;
  // 文章作者 id
  article.authorId = article.author._id;
  // 文章作者
  article.author = article.author.username;
  // aid 更新为 _id
  article.aid = article._id;
  // 删除 markdown, user
  delete article.markdown;
  delete article.user;

  // 输出返回值
  const status = 200;
  const body = { status, article };
  ctx.status = status;
  ctx.body = body;
});


/**
 * 新增文章
 */
router.post('/api/v1/article', async ctx =>{
  const { title, digest, tags, markdown, markup } = ctx.request.body;
  // 文章作者
  const author = ctx.session.objectId;
  const updateAt = createAt = parseInt(Date.now()/1000);
  // 写入
  const res = await Article.create({ author, title, tags, digest, views: 0,
                                    comments: 0, likes: 0, createAt, updateAt,
                                    markdown, markup, heat: 0 });

  // 输出 response
  ctx.status = 200;
  ctx.body = { _id: res._id };
});

/**
 * 读取所有标签
 */
router.get('/api/v1/tags', async ctx => {
  // 读取所有标签  { _id: 0, tag: 1, by: 1 } _id:0 不返回 _id，tag:1, by:1 只返回 tag
  var tags = await Tag.find({}).sort({'tag': -1});

  // 输出返回值
  ctx.status = 200;
  ctx.body = tags;
});

module.exports = router;
