const Koa = require('koa');
const next = require('next');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const koaSession = require("koa-session2");
const mongoose = require('./server/utils/mongoose');
const SessionStore = require("./server/utils/session-store");
const server = require('koa-static');
const User = require('./server/models/user');

// 导入路由
const user = require('./server/routers/user');
const session = require('./server/routers/session');
const excerpt = require('./server/routers/excerpt');
const article = require('./server/routers/article');
const notice = require('./server/routers/notice');
const topic = require('./server/routers/topic');
const profile = require('./server/routers/profile');
const search = require('./server/routers/search');
const upload = require('./server/routers/upload');
const admin = require('./server/routers/admin');

// 端口号
const port = parseInt(process.env.PORT, 10) || 527;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
  const koa = new Koa();
  const router = new Router();

  koa.keys = ['my queen'];

  // 定义静态文件存储路径
  koa.use(server('./server/static'));
  koa.use(koaSession({
    store: new SessionStore(mongoose)
  }));
  koa.use(bodyParser());

  // 登录页面路由
  router.get('/login', async ctx => {
    // 已登录则跳转到主页
    if (ctx.session.uid) {
      await ctx.redirect('/');
      await app.render(ctx.req, ctx.res, '/index', ctx.params);
    } else {
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 文章详情页路由
  router.get('/article/:aid', async ctx => {
    // 已登录进入 article 页面，未登录则跳转到 login 登录页面
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/article', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 编辑文章路由
  router.get('/markdown/:aid', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/markdown', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 写新文章路由
  router.get('/markdown', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/markdown', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 文章管理路由
  router.get('/manage', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/manage', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 个人主页
  router.get('/user/:user', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/profile', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 话题
  router.get('/topic/:topic', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/topic', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 话题广场
  router.get('/topics', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/topics', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 后台管理
  router.get('/admin', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/admin', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 主页路由
  router.get('/', async ctx => {
    if (ctx.session.uid) {
      await app.render(ctx.req, ctx.res, '/index', ctx.params);
    } else {
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
    }

    ctx.respond = false;
  })

  // 应用外部路由文件
  koa.use(user.routes()).use(user.allowedMethods());
  koa.use(excerpt.routes()).use(excerpt.allowedMethods());
  koa.use(session.routes()).use(session.allowedMethods());
  koa.use(article.routes()).use(article.allowedMethods());
  koa.use(notice.routes()).use(notice.allowedMethods());
  koa.use(topic.routes()).use(topic.allowedMethods());
  koa.use(profile.routes()).use(profile.allowedMethods());
  koa.use(search.routes()).use(search.allowedMethods());
  koa.use(upload.routes()).use(upload.allowedMethods());
  koa.use(admin.routes()).use(admin.allowedMethods());

  // 特定路由放在通用路由 * 之前, 检查用户登录状态
  router.get('*', async ctx => {
    // session.uid不存在则判断 cookie.uid是否合法，在数据库中查找 uid
    if (!ctx.session.uid) {
      if (ctx.cookies.get('uid')) {
        const uid = ctx.cookies.get('uid');
        const user = await User.findOne({ uid });

        // cookie.uid 合法则将 uid,username,avator 写入session
        if (user) {
          ctx.session.uid       = user.uid;
          ctx.session.username  = user.username;
          ctx.session.avatar    = user.avatar;
        }
      }
    }

    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  })

  koa.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  })

  // 应用路由
  koa.use(router.routes());

  // 开启服务器监听
  koa.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  })
}).catch((e) => {
  console.log(e.stack);
})
