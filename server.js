const Koa = require('koa');
const next = require('next');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const koaSession = require("koa-session2");
const mongoose = require('./server/utils/mongoose');
const SessionStore = require("./server/utils/session-store");
const server = require('koa-static');
const jsonPretty = require('./server/routers/json-pretty');

// 导入model
const User = require('./server/models/user');
const Article = require('./server/models/article');

// 导入路由
const user = require('./server/routers/user');
const session = require('./server/routers/session');
const excerpt = require('./server/routers/excerpt');
const article = require('./server/routers/article');
const notice = require('./server/routers/notice');
const topic = require('./server/routers/topic');
const search = require('./server/routers/search');
const upload = require('./server/routers/upload');
const admin = require('./server/routers/admin');
const index = require('./server/routers/index');

// 端口号
const port = parseInt(process.env.PORT, 10) || 80;
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
    await app.render(ctx.req, ctx.res, '/article', ctx.params);
    ctx.respond = false;
  })

  // 编辑文章路由
  router.get('/markdown/:aid', async ctx => {
    await app.render(ctx.req, ctx.res, '/markdown', ctx.params);
    ctx.respond = false;
  })

  // 写新文章路由
  router.get('/markdown', async ctx => {
    await app.render(ctx.req, ctx.res, '/markdown', ctx.params);
    ctx.respond = false;
  })

  // 文章管理路由
  router.get('/manage', async ctx => {
    await app.render(ctx.req, ctx.res, '/manage', ctx.params);
    ctx.respond = false;
  })

  // 个人主页
  router.get('/user/:user', async ctx => {
    await app.render(ctx.req, ctx.res, '/profile', ctx.params);
    ctx.respond = false;
  })

  // 话题
  router.get('/topic/:topic', async ctx => {
    await app.render(ctx.req, ctx.res, '/topic', ctx.params);
    ctx.respond = false;
  })

  // 话题广场
  router.get('/topics', async ctx => {
    await app.render(ctx.req, ctx.res, '/topics', ctx.params);
    ctx.respond = false;
  })

  // 后台管理
  router.get('/admin', async ctx => {
    await app.render(ctx.req, ctx.res, '/admin', ctx.params);
    ctx.respond = false;
  })

  // 搜索结果展示页面
  router.get('/search', async ctx => {
    await app.render(ctx.req, ctx.res, '/search', ctx.params);
    ctx.respond = false;
  })

  // 主页路由
  router.get('/', async ctx => {
    await app.render(ctx.req, ctx.res, '/index', ctx.params);
    ctx.respond = false;
  })

  // koa 中间件，在进入任意路由之前执行，用于检查登录状态
  koa.use(async (ctx, next) => {
    if (!ctx.session.uid && ctx.path.indexOf('/api/') === -1 && ctx.path !== '/login') {
      // 未登录，路径不包含/api/且不是/login则跳转到 /login 登录页面
      await ctx.redirect('/login');
      await app.render(ctx.req, ctx.res, '/login', ctx.params);
      ctx.respond = false;
    } else if (!ctx.session.uid && ctx.path.indexOf('/api/') !== -1 && ctx.path !== '/api/v1/session') {
      // 未登录访问 api 接口提示 Requires Authentication，如果路径为 /api/v1/session 则不返回 401交由 /api/v1/session 路由处理
      jsonPretty(ctx, 401, { message: 'Requires Authentication' });
    } else {
      ctx.status = 200;
      await next();
    }
  })

  // 应用外部路由文件
  koa.use(user.routes()).use(user.allowedMethods());
  koa.use(excerpt.routes()).use(excerpt.allowedMethods());
  koa.use(session.routes()).use(session.allowedMethods());
  koa.use(article.routes()).use(article.allowedMethods());
  koa.use(notice.routes()).use(notice.allowedMethods());
  koa.use(topic.routes()).use(topic.allowedMethods());
  koa.use(search.routes()).use(search.allowedMethods());
  koa.use(upload.routes()).use(upload.allowedMethods());
  koa.use(admin.routes()).use(admin.allowedMethods());
  koa.use(index.routes()).use(index.allowedMethods());

  router.get('*', async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  })

  //  koa 中间件, 未匹配到路由时触发
  koa.use(async (ctx, next) => {
    // 当路径包含 api 但又没有匹配到路由时返回 404
    if (ctx.path.indexOf('/api/') !== -1) {
      jsonPretty(ctx, 404, { message: 'Not Found', api_url: `${ctx.origin}/api/v1` });
    } else {
      ctx.status = 200;
      await next();
    }
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
