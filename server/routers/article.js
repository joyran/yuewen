/**
 * 文章路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Like = require('../models/like');
var Topic = require('../models/topic');
var User = require('../models/user');
var Collection = require('../models/collection');
var Comment = require('../models/comment');
var Notice = require('../models/notice');


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

  // 每访问一次文章阅读数加 1，热度加 1
  await Article.findByIdAndUpdate({ _id: aid }, { views_count: article.views_count + 1, heat: article.heat + 1 }).exec();

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

  // 读取评论
  const comments = await Comment.find({ article: aid }).sort({ created_at: -1 })
                                .populate('author').populate('atuser').populate('reply_to_author')
                                .skip(skip).limit(per_page).lean();

  // 删除用户密码
  comments.map(comment => {
    delete comment.author.password;
    delete comment.atuser.password;
    if (comment.reply_to_author) delete comment.reply_to_author.password;
  })

  // 输出返回值
  ctx.status = 200;
  ctx.body = comments;
});

// 递归查找回复的评论，即这条评论是回复谁的，逆向向上查找
const findUpConversation = async comment => {
  const find_comment = await Comment.findOne({ _id: comment.rid }).populate('reply_to_author').lean();

  // 查找不到回复则退出递归
  if (!find_comment) return [];
  // 原始评论，也就是 reply_to_author 为空的，退出递归
  if (!find_comment.reply_to_author) return [find_comment._id];
  // 如果被回复的评论的 reply_to_author 与当前评论的 author 不相等也退出递归
  if (String(find_comment.reply_to_author._id) !== String(comment.author)) return [find_comment._id];

  // 递归合并评论的索引 _id 到数组
  return [find_comment._id].concat(await findUpConversation(find_comment));
}

// 递归查找评论的回复，即这条评论有哪些回复，
const findDownConversation = async comment => {
  const { _id, rid, author, reply_to_author } = comment;

  // 查找评论的回复，且 author 和 reply_to_author 互换的
  const find_comment = await Comment.findOne({ rid: _id, author: reply_to_author, reply_to_author: author }).lean();
  // 查找不到回复则退出递归
  if (!find_comment) return [];

  // 递归合并评论的索引 _id 到数组
  return [find_comment._id].concat(await findDownConversation(find_comment));
}

/**
 * 读取评论的对话
 * 方法: GET
 * 参数: aid 文章索引
 * 参数: cid 评论索引
 */
router.get('/api/v1/articles/:aid/comments/:cid/conversation', async ctx => {
  const { aid, cid } = ctx.params;
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
  if (!article) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  const comment = await Comment.findOne({ _id: cid }).lean();
  if (!comment) {
    ctx.status = 404;
    ctx.body = { message: 'Not Found' };
    return;
  }

  const topConversation = await findUpConversation(comment);
  const downConversation = await findDownConversation(comment);
  var conversation = topConversation.concat(comment._id).concat(downConversation);
  var conversation = await Comment.find({ _id: { $in: conversation } }).sort({ created_at: 1 })
                                  .populate('author').populate('atuser').populate('reply_to_author').lean();
  ctx.status = 200;
  ctx.body = conversation;
})


/**
 * 创建新的评论
 * 方法: POST
 * 参数: aid 文章索引
 * 参数: content 评论内容
 */
router.post('/api/v1/articles/:aid/comments', async ctx => {
  const { aid } = ctx.params;
  const { uid } = ctx.session;
  const { content } = ctx.request.body;

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

  // 文章评论 rid 为 000000000000000000000000
  const rid = reply_to_author = '000000000000000000000000';
  const created_at = parseInt(Date.now()/1000);

  // 写入评论
  const comment = await Comment.create({ author: uid, atuser, rid, reply_to_author, article: aid, content, created_at });

  // 评论写入成功后文章评论数量 comments_count +1
  await Article.findByIdAndUpdate({ _id: aid }, { comments_count: article.comments_count + 1 }).exec();

  // 生成新的评论通知消息
  await Notice.create({
    atuser,
    content,
    link_url: `/article/${aid}#comment-${comment._id}`,
    title: `${user.name} 评论了你的文章 《${article.title}》`,
    initiator: uid,
    has_view: false,
    type: 'comment',
    created_at
  });

  // 输出返回值
  ctx.status = 201;
  ctx.body = comment;
});


/**
 * 创建新的评论回复
 */
router.post('/api/v1/articles/:aid/comments/:cid/replys', async ctx => {
  const { aid, cid } = ctx.params;
  const { uid } = ctx.session;
  const { content, atuser } = ctx.request.body;

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

  // 写入评论的回复
  var comment = await Comment.create({ author: uid, atuser, reply_to_author: atuser, rid: cid, article: aid, content, created_at });

  // 评论写入成功后文章评论数量 comments_count + 1
  await Article.findByIdAndUpdate({ _id: aid }, { comments_count: article.comments_count + 1 }).exec();

  // 生成新的评论回复通知消息
  await Notice.create({
    atuser,
    content,
    link_url: `/article/${aid}#comment-${comment._id}`,
    title: `${user.name} 回复了你在文章 《${article.title}》 中的评论`,
    initiator: uid,
    has_view: false,
    type: 'comment',
    created_at
  });

  // 输出返回值
  ctx.status = 201;
  ctx.body = comment;
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


module.exports = router;
