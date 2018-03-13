/**
 * 文章路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Like = require('../models/like');
var Tag = require('../models/tag');
var User = require('../models/user');
var Collection = require('../models/collection');
var Comment = require('../models/comment');
var Notice = require('../models/notice');


/**
 * 根据 cid 和 aid 读取该评论的所有回复
 */
const readArticleCommentReplys = async (aid, cid) => {
  var replys = await Comment.find({ article: aid, cid }).sort({ created_at: -1 })
                            .populate('author').populate('atuser').lean();

  replys.map((reply) => {
    // 删除用户密码
    delete reply.author.password;
    delete reply.atuser.password;
  })

  return replys;
}

/**
 * 读取指定文章的所有评论，包括评论的回复
 * @param aid  文章索引 id
 */
const readArticleComments = async (aid, skip, limit) => {
  // cid 为 "000000000000000000000000" 表示原始评论，否则为评论的回复
  var comments = await Comment.find({ article: aid, cid: '000000000000000000000000' })
                              .sort({ created_at: -1 }).populate('author').populate('atuser')
                              .lean().skip(skip).limit(limit);

  comments.map(comment => {
    // 删除用户密码
    delete comment.author.password;
    delete comment.atuser.password;
  })

  // 不能在 map 中直接操作
  for (var i = 0; i < comments.length; i++) {
    var replys = await readArticleCommentReplys(aid, comments[i]._id);
    comments[i].replys = replys;
  }

  return comments;
}


/**
 * 读取所有文章
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 10
 */
router.get('/api/v1/articles', async ctx => {
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  var articles = await Article.find({}).sort({ created_at: -1 })
                              .skip(skip).limit(per_page).populate('author').lean();
  articles.map((article) => {
    delete article.author.password;

    // 文章评论 url
    article.comments_url = `/api/v1/articles/${article._id}/comments`;

    // 文章点赞用户 url
    article.likes_url = `/api/v1/articles/${article._id}/likes`;
  })

  ctx.status = 200;
  ctx.body = articles;
});


/**
 * 读取指定文章
 * 方法: GET
 * 参数: aid, 文章 id
 */
router.get('/api/v1/articles/:aid', async ctx => {
  const { uid } = ctx.session;
  const { aid } = ctx.params;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var article = await Article.findOne({ _id: aid }).populate('author').lean();

  if (!article) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 每访问一次文章阅读数加 1
  var result = await Article.findByIdAndUpdate({ _id: aid }, { views_count: article.views_count + 1 }).exec();

  // 查找该篇文章是否已经被当前登录用户收藏
  var collection = await Collection.findOne({ user: uid, article: aid });
  article.has_collected = collection ? true : false;

  // 查找该篇文章是否被当前登录用户点过赞
  var like = await Like.findOne({ user: uid, article: aid });
  article.has_liked = like ? true : false;

  // 文章评论 url
  article.comments_url = `/api/v1/articles/${aid}/comments`;

  // 文章点赞用户 url
  article.likes_url = `/api/v1/articles/${aid}/likes`;

  // 删除用户密码
  delete article.author.password;

  ctx.status = 200;
  ctx.body = article;
});


/**
 * 新增文章
 * 方法: POST
 * 参数: title      标题
 * 参数: excerpt    摘要
 * 参数: tags       标签
 * 参数: markdown   markdown 原始格式
 * 参数: html     markdown 解析后的 html 格式
 */
router.post('/api/v1/articles', async ctx => {
  const { uid } = ctx.session;
  const { title, excerpt, tags, markdown, html } = ctx.request.body;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  // 文章发布时间和更新时间戳
  const updated_at = created_at = parseInt(Date.now()/1000);

  // 写入文章
  const article = await Article.create({ author: uid, title, tags, excerpt, views_count: 0,
                                        comments_count: 0, likes_count: 0, created_at, updated_at,
                                        markdown, html, heat: 0 });

  ctx.status = 201;
  ctx.body = article;
});


/**
 * 更新文章
 * 方法: PUT
 * 参数: title      标题
 * 参数: excerpt    摘要
 * 参数: tags       标签
 * 参数: markdown   markdown 原始格式
 * 参数: html     markdown 解析后的 html 格式
 */
router.put('/api/v1/articles/:aid', async ctx => {
  const { uid } = ctx.session;
  const { aid } = ctx.params;
  const { title, excerpt, tags, markdown, html } = ctx.request.body;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 文章发布时间和更新时间戳
  const updated_at = created_at = parseInt(Date.now()/1000);

  // 更新文章
  const article = await Article.findByIdAndUpdate({ _id: aid }, { author: uid, title, tags, excerpt, views_count: 0,
                                                  comments_count: 0, likes_count: 0, created_at,
                                                  updated_at, markdown, html, heat: 0 }).exec();

  ctx.status = 201;
  ctx.body = article;
});


/**
 * 删除文章
 */
router.delete('/api/v1/articles/:aid', async ctx => {
  const { uid } = ctx.session;
  const { login, aid } = ctx.params;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 删除文章
  const res = await Article.remove({ _id: aid, author: uid }).exec();
  if (!res) {
    ctx.status = 403;
    ctx.body = { message: '没有权限删除文章' };
    return;
  }

  // 输出返回值
  ctx.status = 204;
  ctx.body = {};
});


/**
 * 收藏文章
 * 方法: POST
 * 参数: aid    文章 id
 */
router.post('/api/v1/articles/:aid/collect', async ctx => {
  const { aid } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 查找该篇文章是否被当前登录用户已经收藏
  var result = await Collection.findOne({ article: aid, user: uid });

  // 如果已经收藏过则直接返回
  if (result) {
    ctx.status = 403;
    ctx.body = { has_collected: true };
    return;
  } else {
    // 添加收藏
    let created_at = parseInt(Date.now()/1000);
    await Collection.create({ article: aid, user: uid, created_at });
    ctx.status = 201;
    ctx.body = { has_collected: true };
    return;
  }
});


/**
 * 取消收藏文章
 * 方法: DELETE
 * 参数: aid    文章 id
 */
router.delete('/api/v1/articles/:aid/collect', async ctx => {
  const { aid } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 查找该篇文章是否被当前登录用户已经收藏
  var result = await Collection.findOne({ article: aid, user: uid });

  // 如果已经收藏过则取消收藏
  if (result) {
    await Collection.findByIdAndRemove(result._id).exec();
    ctx.status = 204;
    ctx.body = { has_collected: false };
    return;
  } else {
    ctx.status = 404;
    ctx.body = { message: '未找到收藏记录' };
    return;
  }
});


/**
 * 读取文章评论和回复
 * 方法: GET
 */
router.get('/api/v1/articles/:aid/comments', async ctx => {
  const { aid } = ctx.params;
  const { uid } = ctx.session;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  const comments = await readArticleComments(aid, skip, per_page);
  const comments_count = await Comment.find({ article: aid, cid: '000000000000000000000000' }).count({});
  const comments_pages = parseInt(comments_count / per_page) + 1;

  // 输出返回值
  ctx.status = 200;
  ctx.body = { comments, comments_count, comments_pages };
});


/**
 * 创建新的评论
 */
router.post('/api/v1/articles/:aid/comments', async ctx => {
  const { aid } = ctx.params;
  const { uid } = ctx.session;
  const { comment } = ctx.request.body;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 根据 aid 读取文章作者，也就是被@的用户
  const article = await Article.findOne({ _id: aid }).lean();
  if (!article) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 评论@的用户
  const atuser = article.author;

  // 当前登录用户
  const user = await User.findOne({ _id: uid }).lean();

  // 文章评论 cid 为 000000000000000000000000
  const cid = '000000000000000000000000';
  const created_at = parseInt(Date.now()/1000);

  // 写入评论
  const result = await Comment.create({ author: uid, atuser, cid, article: aid, comment, created_at });

  // 评论写入成功后文章评论数量 comments_count +1
  await Article.findByIdAndUpdate({ _id: aid }, { comments_count: article.comments_count + 1 }).exec();

  // 生成新的评论通知消息
  await Notice.create({
    atuser: atuser,
    content: comment,
    link_url: `/article/${aid}#comment-${result._id}`,
    title: `${user.name} 评论了你的文章 《${article.title}》`,
    initiator: uid,
    has_view: false,
    type: 'comment',
    created_at
  });

  // 写入成功后重新读取所有的评论并返回给前端显示
  const per_page = 10;
  const comments = await readArticleComments(aid, 0, per_page);
  const comments_count = await Comment.find({ article: aid, cid }).count({});
  const comments_pages = parseInt(comments_count / per_page) + 1;

  // 输出返回值
  ctx.status = 201;
  ctx.body = { comments, comments_count, comments_pages };
});


/**
 * 创建新的评论回复
 */
router.post('/api/v1/articles/:aid/comments/:cid/replys', async ctx => {
  const { aid, cid } = ctx.params;
  const { uid } = ctx.session;
  const { reply, atuser } = ctx.request.body;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24 || cid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  // 根据 aid 读取文章作者，也就是被@的用户
  const article = await Article.findOne({ _id: aid }).lean();
  if (!article) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  const user = await User.findOne({ _id: uid }).lean();
  const created_at = parseInt(Date.now()/1000);

  // 写入评论
  var result = await Comment.create({ author: uid, atuser, cid, article: aid, comment: reply, created_at });

  // 评论写入成功后文章评论数量 comments_count + 1
  await Article.findByIdAndUpdate({ _id: aid }, { comments_count: article.comments_count + 1 }).exec();

  // 生成新的评论回复通知消息
  await Notice.create({
    atuser: atuser,
    content: reply,
    link_url: `/article/${aid}#comment-${result._id}`,
    title: `${user.name} 回复了你在文章 《${article.title}》 中的评论`,
    initiator: uid,
    has_view: false,
    type: 'comment',
    created_at
  });

  // 写入成功后重新读取所有的评论并返回给前端显示
  const per_page = 10;
  const comments = await readArticleComments(aid, 0, per_page);
  const comments_count = await Comment.find({ article: aid, cid }).count({});
  const comments_pages = parseInt(comments_count / per_page) + 1;

  // 输出返回值
  ctx.status = 201;
  ctx.body = { comments, comments_count, comments_pages };
});


/**
 * 读取文章所有点赞人
 */
router.get('/api/v1/articles/:aid/likes', async ctx => {
  const { aid } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  var likes = await Like.find({ article: aid }).populate('user').lean();

  likes.map((like) => {
    // 删除用户密码
    delete like.user.password;
  })

  ctx.status = 200;
  ctx.body = likes;
})


/**
 * 点赞文章
 */
router.post('/api/v1/articles/:aid/likes', async ctx => {
  const { aid } = ctx.params;
  const { uid } = ctx.session;

  if (!uid) {
    ctx.status = 401;
    ctx.body = { message: '需要登录' };
    return;
  }

  if (aid.length !== 24) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  const article = await Article.findOne({ _id: aid }).lean();
  const user = await User.findOne({ _id: uid }).lean();

  // 查找该篇文章是否被当前登录用户点过赞
  var like = await Like.findOne({ article: aid, user: uid });

  // 未点赞添加点赞记录
  if (!like) {
    var created_at = parseInt(Date.now()/1000);
    await Like.create({ article: aid, user: uid, created_at });

    // 文章点赞数加 1
    await Article.findByIdAndUpdate({ _id: aid }, { likes_count: article.likes_count + 1 }).exec();

    // 生成点赞通知消息
    await Notice.create({
      atuser: article.author,
      content: '',
      link_url: `/article/${aid}`,
      title: `${user.name} 点赞了文章 《${article.title}》`,
      initiator: uid,
      has_view: false,
      type: 'like',
      created_at
    });
  }

  var likes = await Like.find({ article: aid }).populate('user').lean();

  likes.map((like) => {
    // 删除用户密码
    delete like.user.password;
  })

  ctx.status = 201;
  ctx.body = likes;
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
