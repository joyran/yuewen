/**
 * 用户
 */

const Router = require('koa-router');
const router = new Router();
const User = require('../models/user');
const Article = require('../models/article');
const Collection = require('../models/collection');
const jsonPretty = require('./json-pretty');

/**
 * 读取当前登录用户基本信息
 * 方法: GET
 * 参数: 无
 * 返回值: 用户基本信息
 */
router.get('/api/v1/user', async ctx => {
  const { uid } = ctx.session;
  var user = await User.findOne({ _id: uid }).lean();

  if (!user) {
    jsonPretty(ctx, 401, { message: 'Requires Authentication' });
    return;
  }

  // 删除用户密码
  delete user.password;

  // 用户发表的文章总数量
  const articles_count = await Article.find({ author: uid }).count({});
  user.articles_count = articles_count;

  // 用户收藏的文章总数量
  const collects_count = await Collection.find({ user: user._id }).count({});
  user.collects_count = collects_count;

  user.followers_count = user.followers.length;
  user.following_count = user.following.length;

  jsonPretty(ctx, 200, user);
});

/**
 * 读取所有用户
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 10
 * 返回值: 用户基本信息数组
 */
router.get('/api/v1/users', async ctx => {
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;
  const { uid } = ctx.session;

  var users = await User.find({}).sort({ created_at: -1 }).skip(skip).limit(per_page).lean();
  users.map((user) => {
    delete user.password;
  });

  jsonPretty(ctx, 200, users);
});


/**
 * 读取指定用户
 * 方法: GET
 * 参数: user, 用户登录唯一标识
 * 返回值: 用户基本信息
 */
router.get('/api/v1/users/:login', async ctx => {
  const { login } = ctx.params;
  const { uid } = ctx.session;

  var user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  // 删除用户密码
  delete user.password;

  // 用户发表的文章总数量
  const articles_count = await Article.find({ author: user._id }).count({});
  user.articles_count = articles_count;

  // 用户收藏的文章总数量
  const collects_count = await Collection.find({ user: user._id }).count({});
  user.collects_count = collects_count;

  user.followers_count = user.followers.length;
  user.following_count = user.following.length;

  delete user.followers;
  delete user.following;

  jsonPretty(ctx, 200, user);
});


/**
 * 读取用户所有发表的文章
 * 方法: GET
 * 参数: page, 第几页，默认第一页
 * 参数: per_page, 每页数量，默认 10
 */
router.get('/api/v1/users/:login/articles', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  var user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  var articles = await Article.find({ author: user._id }).sort({ created_at: -1 })
                              .skip(skip).limit(per_page).populate('author').lean();
  articles.map((article) => {
    // 删除作者密码
    delete article.author.password;
  })

  jsonPretty(ctx, 200, articles);
});


/**
 * 读取用户发表的指定文章
 * 方法: GET
 */
router.get('/api/v1/users/:login/articles/:aid', async ctx => {
  const { uid } = ctx.session;
  const { login, aid } = ctx.params;

  if (aid.length !== 24) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  var user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  var article = await Article.findOne({ author: user._id, _id: aid }).lean();
  if (!article) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  // 删除作者密码
  delete article.author.password;

  jsonPretty(ctx, 200, article);
});


/**
 * 读取关注当前登录用户的用户
 * 方法: GET
 */
router.get('/api/v1/users/:login/followers', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  const user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  const followers = await User.find({ _id: { $in: user.followers }}).skip(skip).limit(per_page).lean();
  const total = user.followers.length;

  followers.map((follower) => {
    // 删除用户密码
    delete follower.password;
  })

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page < total;

  jsonPretty(ctx, 200, { data: followers, has_more });
});


/**
 * 读取当前登录用户关注的用户
 * 方法: GET
 */
router.get('/api/v1/users/:login/following', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const skip = (page - 1) * per_page;

  const user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  const following = await User.find({ _id: { $in: user.following }}).skip(skip).limit(per_page).lean();
  const total = user.following.length;

  following.map((user) => {
    // 删除用户密码
    delete user.password;
  })

  // 检测是否还有更多，总数小于 skip + per_page 则没有更多了。
  const has_more = skip + per_page < total;

  jsonPretty(ctx, 200, { data: following, has_more });
});


/**
 * 关注某个用户
 * 方法: PUT
 */
router.put('/api/v1/user/following/:login', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;

  const currentUser = await User.findOne({ _id: uid }).lean();
  const user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  var res = await User.findByIdAndUpdate({ _id: uid }, { following: currentUser.following.concat([user._id]) }, { 'new': true }).exec();
  await User.findByIdAndUpdate({ _id: user._id }, { followers: user.followers.concat([uid]) }).exec();

  jsonPretty(ctx, 200, res);
});


/**
 * 取消关注某个用户
 * 方法: DELETE
 */
router.delete('/api/v1/user/following/:login', async ctx => {
  const { uid } = ctx.session;
  const { login } = ctx.params;

  const currentUser = await User.findOne({ _id: uid }).lean();
  const user = await User.findOne({ login }).lean();
  if (!user) {
    jsonPretty(ctx, 404, { message: 'Not Found' });
    return;
  }

  // 当前登录用户 following 列表中删除用户
  var res = await User.findByIdAndUpdate({ _id: uid }, { $pull: { following: user._id }}, { 'new': true }).exec();
  // 用户 followers 列表中删除当前登录用户
  await User.findByIdAndUpdate({ _id: user._id }, { $pull: { followers: uid }}).exec();

  jsonPretty(ctx, 200, res);
});


/**
 * 修改用户登录密码
 * 方法： PUT
 * 参数： oldpassword, 旧密码
 * 参数： newpassword, 新密码
 * 返回值： 成功返回空，失败返回错误消息
 */
router.put('/api/v1/user/password', async ctx => {
  const { oldpassword, newpassword } = ctx.request.body;
  const { uid } = ctx.session;

  // 验证旧密码是否正确
  var result = await User.findOne({ _id: uid, password: oldpassword });
  if (!result) {
    jsonPretty(ctx, 401, { message: '旧密码不正确' });
    return;
  }

  // 旧密码正确则修改密码
  await User.findByIdAndUpdate({ _id: uid }, { password: newpassword }).exec();
  jsonPretty(ctx, 201, {});
});

module.exports = router;
