/**
 * API 路由主页
 */

const Router = require('koa-router');
const router = new Router();
const jsonPretty = require('./json-pretty');

router.get('/api/v1', async ctx => {
  const body = {
    current_user_url: `${ctx.origin}/api/v1/user`,
    all_user_url: `${ctx.origin}/api/v1/users{&page,per_page}`,
    user_url: `${ctx.origin}/api/v1/users/{user}`,
  };
  jsonPretty(ctx, 200, body);
});


module.exports = router;
