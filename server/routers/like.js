/**
 * 文章点赞路由
 */

var Router = require('koa-router');
var router = new Router();
var Article = require('../models/article');
var Like = require('../models/like');
var Notice = require('../models/notice');
var User = require('../models/user');


/**
 * 读取文章点赞列表和点赞人数
 */
router.get('/api/v1/article/like', async ctx => {
  const aid = ctx.query.aid;
  const uid = ctx.session.uid;
  var like = {};

  // 获取更新后的点赞人列表
  var likers = await Like.find({ article: aid }).populate('user').lean();

  likers.map((liker) => {
    // 删除不必要显示的敏感信息
    delete liker.user.password;
    delete liker.user.isAdmin;
  })

  like.likers = likers;

  // 查找该篇文章是否被当前登录用户点过赞，已点赞 isLiked 为 true，反之为 false
  var ret = await Like.findOne({ article: aid, user: uid });
  like.hasLike = ret ? true : false;

  // 输出返回值
  const status = 200;
  const body = { status, like };
  ctx.status = status;
  ctx.body = body;
})


/**
 * 文章点赞或者取消点赞
 */
router.post('/api/v1/article/like', async ctx => {
  const { aid } = ctx.request.body;
  const uid = ctx.session.uid;

  const article = await Article.findOne({ _id: aid }).lean();
  const user = await User.findOne({ _id: uid }).lean();

  // 查找该篇文章是否被当前登录用户点过赞
  var ret = await Like.findOne({ article: aid, user: uid });

  // 如果已经点过赞则取消点赞，反之添加点赞记录
  if (ret) {
    // 删除点赞记录
    await Like.findByIdAndRemove(ret._id).exec();

    // 文章点赞数减 1
    await Article.findByIdAndUpdate({ _id: aid }, { likes: article.likes - 1 }).exec();
  } else {
    // 添加点赞记录
    var createAt = parseInt(Date.now()/1000);
    await Like.create({ article: aid, user: uid, createAt });

    // 文章点赞数加 1
    await Article.findByIdAndUpdate({ _id: aid }, { likes: article.likes + 1 }).exec();

    // 生成点赞通知消息
    await Notice.create({
      at: article.author,
      content: '',
      link: `/article/${aid}`,
      title: `${user.username} 点赞了文章 ${article.title}`,
      initiator: uid,
      hasView: false,
      type: 'like',
      createAt
    });
  }

  // 获取更新后的点赞人列表
  var likers = await Like.find({ article: aid }).populate('user').lean();
  likers.map((liker) => {
    // 删除不必要显示的敏感信息
    delete liker.user.password;
    delete liker.user.isAdmin;
  })

  const status = 200;

  // 输出返回值
  const body = { status, likers };
  ctx.status = status;
  ctx.body = body;
});

module.exports = router;
