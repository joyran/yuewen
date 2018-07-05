/**
 * 搜索路由
 */

const fetch = require('isomorphic-fetch');
const Router = require('koa-router');
const router = new Router();
const Article = require('../models/article');
const jsonPretty = require('./json-pretty');

/**
 * 通用搜索，文章只列出前5个搜索结果，用户只列出前3个搜索结果
 */
router.get('/api/v1/search/all', async ctx => {
  // 搜索关键词
  const query = ctx.query.q;

  // 搜索文章，字段标题
  var res = await fetch('http://localhost:9200/yue/articles/_search', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'should': [
            { 'match': { 'title': query }}
          ]
        }
      },
      'highlight': {
        'fields' : {
          'title' : {}
        }
      },
      'size': 5
    })
  });
  var res = await res.json();
  var articles = res.hits.hits;
  var articlesTotal = res.hits.total;

  // 搜索用户，字段姓名
  var res = await fetch('http://localhost:9200/yue/users/_search', {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'should': [
            { 'match': { 'name': query }}
          ]
        }
      },
      'highlight': {
        'fields' : {
          'name' : {}
        }
      },
      'size': 3
    })
  });
  var res = await res.json();
  var users = res.hits.hits;
  var usersTotal = res.hits.total;

  // 搜索结果数量
  var total = articlesTotal + usersTotal;

  // 返回搜索结果
  jsonPretty(ctx, 200, {
    data: {
      articles,
      users
    },
    total
  });
});


/**
 * 搜索文章
 */
router.get('/api/v1/search/articles', async ctx => {
  // 搜索关键词
  const query = ctx.query.q;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const from = (page - 1) * per_page;

  // 搜索文章，字段标题和内容
  var res = await fetch(`http://localhost:9200/yue/articles/_search?size=${per_page}&from=${from}`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'should': [
            { 'match': { 'title': query }},
            { 'match': { 'markdown': query }}
          ]
        }
      },
      'highlight': {
        'fields' : {
          'title' : {},
          'markdown' : {}
        }
      }
    })
  });
  var res = await res.json();
  const articles = res.hits.hits;
  const has_more = from + per_page < res.hits.total;

  // 返回搜索结果
  jsonPretty(ctx, 200, {
    data: articles,
    total: res.hits.total,
    has_more
  });
});


/**
 * 搜索用户
 */
router.get('/api/v1/search/users', async ctx => {
  // 搜索关键词
  const query = ctx.query.q;
  const page  = ctx.query.page ? parseInt(ctx.query.page) : 1;
  const per_page = ctx.query.per_page ? parseInt(ctx.query.per_page) : 10;
  const from = (page - 1) * per_page;

  // 搜索文章，字段标题和内容
  var res = await fetch(`http://localhost:9200/yue/users/_search?size=${per_page}&from=${from}`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'query': {
        'bool': {
          'should': [
            { 'match': { 'name': query }}
          ]
        }
      },
      'highlight': {
        'fields' : {
          'name' : {}
        }
      }
    })
  });
  var res = await res.json();
  const users = res.hits.hits;
  const has_more = from + per_page < res.hits.total;

  // 返回搜索结果
  jsonPretty(ctx, 200, {
    data: users,
    total: res.hits.total,
    has_more
  });
});

module.exports = router;
