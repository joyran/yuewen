const Koa = require('koa');
const next = require('next');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const koaSession = require("koa-session2");
const mongoose = require('./server/utils/mongoose');
const SessionStore = require("./server/utils/session-store");
const server = require('koa-static');
const multer = require('koa-multer');

// 导入路由
const session = require('./server/routers/session');
const digest = require('./server/routers/digest');
const article = require('./server/routers/article');
const comment = require('./server/routers/comment');
const like = require('./server/routers/like');
const auth = require('./server/routers/auth');

// 端口号
const port = parseInt(process.env.PORT, 10) || 527;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
  const koa = new Koa();
  const router = new Router();

  koa.keys = ['i love yue'];

  // 定义静态文件存储路径
  koa.use(server('./server/static'));
  koa.use(koaSession({
    store: new SessionStore(mongoose)
  }));
  koa.use(bodyParser());

  // 设置文件存储路径和存储文件名
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'server/static/uploads/article')
    },
    filename: function (req, file, cb) {
      const filename = file.originalname;

      // 文件后缀
      const arr = filename.split('.');
      const suffix = arr[arr.length - 1];
      cb(null,  Date.now() + '.' + suffix);
    }
  });

  // 设置 storage
  const upload = multer({ storage: storage });

  router.post('/api/v1/upload', upload.single('file'), async ctx => {
    const { originalname, filename } = ctx.req.file;
    console.log(ctx.req.file);

    // 文件相对路径
    const filepath = `/uploads/article/${filename}`;
    const status = 200;
    const body = { status, filepath };
    ctx.status = status;
    ctx.body = body;
  });

  // 登录页面路由
  router.get('/login', async ctx => {
    await app.render(ctx.req, ctx.res, '/login', ctx.params);
    ctx.respond = false;
  })

  // 标签页路由, 依旧输出主页 index
  router.get('/tag/:tag', async ctx => {
    await app.render(ctx.req, ctx.res, '/index', ctx.params);
    ctx.respond = false;
  })

  // 文章详情页路由
  router.get('/article/:aid', async ctx => {
    await app.render(ctx.req, ctx.res, '/article', ctx.params);
    ctx.respond = false;
  })

  // 写文章路由
  router.get('/markdown/:aid', async ctx => {
    await app.render(ctx.req, ctx.res, '/markdown', ctx.params);
    ctx.respond = false;
  })

  // 文章管理路由
  router.get('/manage', async ctx => {
    await app.render(ctx.req, ctx.res, '/manage', ctx.params);
    ctx.respond = false;
  })

  // 主页路由
  router.get('/', async ctx => {
    await app.render(ctx.req, ctx.res, '/index', ctx.params);
    ctx.respond = false;
  })

  // 应用外部路由文件
  koa.use(digest.routes()).use(digest.allowedMethods());
  koa.use(session.routes()).use(session.allowedMethods());
  koa.use(article.routes()).use(article.allowedMethods());
  koa.use(comment.routes()).use(comment.allowedMethods());
  koa.use(like.routes()).use(like.allowedMethods());

  // 特定路由放在通用路由 * 之前
  router.get('*', async ctx => {
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
