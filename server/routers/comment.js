/**
 * 文章评论和回复路由
 */

var Router = require('koa-router');
var router = new Router();
var Comment = require('../models/comment');
var Article = require('../models/article');
var User = require('../models/user');
var Notice = require('../models/notice');

/**
 * 根据 rid 和 aid 读取该评论的所有回复
 */
const readArticleCommentReplys = async (aid, rid) => {
  var replys = await Comment.find({ article: aid, rid }).sort({ createAt: -1 })
                            .populate('author').populate('atuser').lean();

  replys.map((reply) => {
    reply.authorName = reply.author.username;
    reply.authorId = reply.author._id;
    reply.cid = reply._id;
    reply.atUserId = reply.atuser._id;
    reply.atUsername = reply.atuser.username;

    // 删除不必要显示的信息
    delete reply.author;
    delete reply._id;
    delete reply.atuser;
  })

  return replys;
}

/**
 * 读取指定文章的所有评论，包括评论的回复
 * @param aid  文章索引 id
 */
const readArticleComments = async (aid) => {
  // mongoose find 查询返回的结果默认不可以修改，除非用 .lean() 查询。
  // 或者用.toObject()转换成 objcet对象
  // rid 为 "000000000000000000000000" 表示原始评论，否则为评论的回复
  var comments = await Comment.find({ article: aid, rid: '000000000000000000000000' })
                              .sort({ createAt: -1 }).populate('author').populate('atuser').lean();

  comments.map(async (comment) => {
    comment.authorName = comment.author.username;
    comment.authorAvatar = comment.author.avatar;
    comment.authorId = comment.author._id;
    comment.cid = comment._id;
    comment.atUserId = comment.atuser._id;
    comment.atUsername = comment.atuser.username;

    // 删除不必要显示的信息
    delete comment.author;
    delete comment._id;
    delete comment.atuser;
  })

  // 不能在 map 中直接操作
  for (var i = 0; i < comments.length; i++) {
    var replys = await readArticleCommentReplys(aid, comments[i].cid);
    comments[i].replys = replys;
  }

  return comments;
}

/**
 * 读取文章评论和回复
 */
router.get('/api/v1/article/comment', async ctx => {
  const aid = ctx.query.aid;
  var comments = await readArticleComments(aid);
  const status = 200;

  // 输出返回值
  const body = { status, comments };
  ctx.status = status;
  ctx.body = body;
});


/**
 * 创建新的评论
 */
router.post('/api/v1/article/comment', async ctx => {
  // aid: 文章索引 id, comment: 评论
  const { aid, comment } = ctx.request.body;

  // 评论作者
  const author = ctx.session.objectId;
  // 根据 aid 读取文章作者，也就是被@的用户
  var article = await Article.findOne({ _id: aid }).lean();
  var atuser = article.author;

  var user = await User.findOne({ _id: author }).lean();

  // 直接评论文章 rid 为 000000000000000000000000
  const rid = '000000000000000000000000';
  const createAt = parseInt(Date.now()/1000);

  // 写入评论
  var newComment = await Comment.create({ author, atuser, rid, article: aid, comment, createAt });

  // 评论写入成功后更新文章评论数量 comments
  await Article.findByIdAndUpdate({ _id: aid }, {comments: article.comments + 1}).exec();

  // 生成新的评论通知消息
  await Notice.create({
    at: atuser,
    content: comment,
    link: `/article/${aid}#comment-${newComment._id}`,
    title: `${user.username} 评论了你的文章 ${article.title}`,
    initiator: author,
    hasView: false,
    type: 'comment',
    createAt
  });

  // 写入成功后重新读取所有的评论并返回给前端显示
  var comments = await readArticleComments(aid);
  const status = 200;

  // 输出返回值
  const body = { status, comments };
  ctx.status = status;
  ctx.body = body;
});


/**
 * 创建新的评论回复
 */
router.post('/api/v1/article/reply', async ctx => {
  // aid: 文章索引 id, reply: 评论回复
  const { aid, reply, atuser, rid } = ctx.request.body;

  // 评论作者
  const author = ctx.session.objectId;
  var user = await User.findOne({ _id: author }).lean();
  var article = await Article.findOne({ _id: aid }).lean();
  const createAt = parseInt(Date.now()/1000);

  // 写入评论
  var newComment = await Comment.create({ author, atuser, rid, article: aid, comment: reply, createAt });

  // 评论写入成功后更新文章评论数量 comments
  await Article.findByIdAndUpdate({ _id: aid }, {comments: article.comments + 1}).exec();

  // 生成新的评论回复通知消息
  await Notice.create({
    at: atuser,
    content: reply,
    link: `/article/${aid}#comment-${newComment._id}`,
    title: `${user.username} 回复了你在文章 ${article.title} 中的评论`,
    initiator: author,
    hasView: false,
    type: 'comment',
    createAt
  });

  // 写入成功后重新读取所有的评论并返回给前端显示
  var comments = await readArticleComments(aid);
  const status = 200;

  // 输出返回值
  const body = { status, comments };
  ctx.status = status;
  ctx.body = body;
});

module.exports = router;
