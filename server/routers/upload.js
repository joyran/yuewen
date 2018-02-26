/**
 * 上传文件路由
 */

const multer = require('koa-multer');
const Router = require('koa-router');
const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');
const router = new Router();
const User = require('../models/user');

// ------------------------------------
// 上传文章图片路由配置
// ------------------------------------

// 设置文件存储路径和存储文件名
var storage = multer.diskStorage({
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
var upload = multer({ storage: storage });

router.post('/api/v1/upload/article', upload.single('file'), async ctx => {
  const { originalname, filename } = ctx.req.file;

  // 文件相对路径
  const filepath = `/uploads/article/${filename}`;
  const status = 200;
  const body = { status, filepath };
  ctx.status = status;
  ctx.body = body;
});


// ------------------------------------
// 上传个人 banner 路由配置
// ------------------------------------

// 设置文件存储路径和存储文件名
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/static/uploads/banner')
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;

    // 文件后缀
    const arr = originalname.split('.');
    const suffix = arr[arr.length - 1];
    const epoch = Date.now();
    const filename = `${epoch}.${suffix}`;
    cb(null, filename);
  }
});

// 设置 storage
var upload = multer({ storage: storage });

/**
 * 上传用户个人主页封面图 banner
 */
router.post('/api/v1/upload/banner', upload.single('file'), async ctx => {
  const { originalname, filename } = ctx.req.file;

  // banner 相对路径
  const filepath = `/uploads/banner/${filename}`;

  const status = 200;
  const body = { status, filepath };
  ctx.status = status;
  ctx.body = body;
});

/**
 * 裁剪封面图 banner
 */
router.post('/api/v1/upload/banner/crop', async ctx => {
  var status = 200;
  const { width, height, x, y, filename } = ctx.request.body;

  // 重新生成裁剪后的头像文件名
  const arr = filename.split('.');
  const suffix = arr[arr.length - 1];
  const timeNow = Date.now();
  const cropBanner = timeNow + '.' + suffix;

  // 根据前台传递的参数裁剪 banner 并压缩到 900*220
  gm(`server/static/uploads/banner/${filename}`)
  .crop(width, height, x, y)
  .resize(900, 220, '!')
  .write(`server/static/uploads/banner/${cropBanner}`, function (err) {
    if (!err) {
      // 删除裁剪之前的原始 banner
      fs.unlink(`server/static/uploads/banner/${filename}`, function (err) {
        if (err) status = 500;
      });
    }
  });

  // 重新裁剪后的 banner 相对路径
  const banner = `/uploads/banner/${cropBanner}`;

  // 更新用户 banner
  User.findByIdAndUpdate({ _id: ctx.session.uid }, { banner }).exec();

  const body = { status, banner };
  ctx.status = status;
  ctx.body = body;
});


// ------------------------------------
// 上传个人头像 avatar 路由配置
// ------------------------------------

// 设置文件存储路径和存储文件名
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/static/uploads/avatar')
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;

    // 文件后缀
    const arr = originalname.split('.');
    const suffix = arr[arr.length - 1];
    const epoch = Date.now();
    const filename = `${epoch}.${suffix}`;
    cb(null, filename);
  }
});

// 设置 storage
var upload = multer({ storage: storage });

router.post('/api/v1/upload/avatar', upload.single('file'), async ctx => {
  const { originalname, filename } = ctx.req.file;

  // banner 相对路径
  const filepath = `/uploads/avatar/${filename}`;

  const status = 200;
  const body = { status, filepath };
  ctx.status = status;
  ctx.body = body;
});

/**
 * 裁剪头像
 */
router.post('/api/v1/upload/avatar/crop', async ctx => {
  var status = 200;
  const { width, height, x, y, filename } = ctx.request.body;

  // 重新生成裁剪后的头像文件名
  const arr = filename.split('.');
  const suffix = arr[arr.length - 1];
  const timeNow = Date.now();
  const cropAvatar = timeNow + '.' + suffix;
  const resizeAvatar = timeNow + '_50.' + suffix;

  // 根据前台传递的参数裁剪头像
  // 根据前台传递的参数裁剪头像并压缩到 200*200
  gm(`server/static/uploads/avatar/${filename}`)
  .crop(width, height, x, y)
  .resize(200, 200, '!')
  .write(`server/static/uploads/avatar/${cropAvatar}`, function (err) {
    if (!err) {
      // 压缩头像图片尺寸到 50*50, 并重命名加后缀 _50
      gm(`server/static/uploads/avatar/${cropAvatar}`)
      .resize(50, 50, '!')
      .write(`server/static/uploads/avatar/${resizeAvatar}`, function (err) {
        if (!err) {
          // 删除裁剪之前的原始头像
          fs.unlink(`server/static/uploads/avatar/${filename}`, function (err) {
            if (err) status = 500;
          });
        }
      });
    } else {
      status = 500;
    }
  });

  // 重新裁剪后的头像相对路径
  const avatar = `/uploads/avatar/${cropAvatar}`;
  const smAvatar = `/uploads/avatar/${resizeAvatar}`;

  // 更新用户头像 avatar
  await User.findByIdAndUpdate({ _id: ctx.session.uid }, { avatar, smAvatar }).exec();

  const body = { status, avatar, smAvatar };
  ctx.status = status;
  ctx.body = body;
});

module.exports = router;
