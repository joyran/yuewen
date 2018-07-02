/**
 * 搜索路由
 */

const fetch = require('isomorphic-fetch');
const Router = require('koa-router');
const router = new Router();
const Article = require('../models/article');
const jsonPretty = require('./json-pretty');

/**
 * 搜索
 */
router.get('/api/v1/search/:keyword', async ctx => {
  var data;
  var status = 200;

  // 搜索关键词
  const keyword = ctx.params.keyword;

  await fetch('http://localhost:9200/yue/articles/_search', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'should': [
            { 'match': { 'title': keyword }},
            { 'match': { 'markdown': keyword }}
          ]
        }
      },
      'highlight': {
        'fields' : {
          'title' : {},
          'markdown': {}
        }
      },
      'size': 5
    })
  })
    .then(res => res.json())
    .then((res) => {
      if (res.error) {
        status = res.status;
      } else {
        data = res.hits.hits;
      }
    })

  jsonPretty(ctx, status, data);
});

module.exports = router;
