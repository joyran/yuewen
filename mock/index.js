const mysql = require('mysql2/promise');
const hljs = require('highlight.js');
const md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const User = require('../server/models/user');
const Article = require('../server/models/article');
const Like = require('../server/models/like');
const Comment = require('../server/models/comment');
const config = require('config');

async function main() {
  var users = {};
  var tags = {};
  var articles = {};
  var comments = {};
  var markdown = '';
  var html = '';
  // 连接 mysql 数据库
  const connection =  await mysql.createConnection({
    host     : '10.68.100.51',
    user     : 'root',
    password : '',
    database : 'yuewen'
  });

  // 读取用户
  var [rows, fields] = await connection.execute('SELECT * FROM mooc_user');
  // 写入到 mongodb
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    let user = {
      login: row['ename'],
      name: row['cname'],
      password: row['pwd'],
      mail: row['email'],
      avatar_url: row['userface'].replace('/yuewen/storage/uploads/img/avatar/','/uploads/avatar/'),
      small_avatar_url: row['userface'].replace('/yuewen/storage/uploads/img/avatar/','/uploads/avatar/'),
      followed_topics: [ "javascript", "css", "python", "html", "qos" ],
      prestige : 0,
      banner_url: "/uploads/banner/default_banner.jpg",
      bio: null,
      state : true,
      admin : false,
      followers: [],
      following: [],
      created_at : parseInt(new Date().getTime()/1000),
    };
    let u = new User(user);
    let res = await u.save();
    users[row['uid']] = res._id;
  }

  // 读取标签
  var [rows, fields] = await connection.execute('SELECT * FROM mooc_article_tag');
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    if (!tags.hasOwnProperty(row['bid'])) {
      tags[row['bid']] = [row['tag']];
    } else {
      var t = tags[row['bid']].concat([row['tag']]);
      tags[row['bid']] = t;
    }
  }

  // 读取文章
  var [rows, fields] = await connection.execute('SELECT * FROM mooc_article');
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    // 文章热度权重
    const view = config.get('heat.view');
    const like = config.get('heat.like');
    const comment = config.get('heat.comment');
    const collect = config.get('heat.collect');
    let heat = parseInt(row['viewnum']) * view + parseInt(row['likenum']) * like + parseInt(row['commnum']) * comment;
    let article = {
      author: users[row['uid']],
      title: row['title'],
      topics: row['tags'] ? row['tags'].split(';') : tags[row['bid']],
      excerpt: row['digest'],
      views_count: row['viewnum'],
      likes_count: row['likenum'],
      comments_count: row['commnum'],
      created_at: parseInt(new Date(row['datetime']).getTime()/1000),
      updated_at: parseInt(new Date(row['update_datetime']).getTime()/1000),
      markdown: row['markdown'].replace(/\/yuewen\/storage\/uploads\/img/g, '/uploads'),
      html: md.render(row['markdown']).replace(/\/yuewen\/storage\/uploads\/img/g, '/uploads'),
      heat
    };
    let a = new Article(article);
    let res = await a.save();
    articles[row['bid']] = res._id;
  }

  // 更新文章中文章链接
  var rows = await Article.find({}).lean();
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    let arr = row.markdown.match(/\/yuewen\/article\/\d+/g);
    console.log(arr);
    if (!arr) continue;
    markdown = row.markdown;
    html = row.html;
    for (var j = 0; j < arr.length; j++) {
      let id = arr[j].split('/')[3];
      let _id = articles[id];
      markdown = markdown.replace(`/yuewen/article/${id}`, `/article/${_id}`);
      markdown = markdown.replace('http://10.68.100.51', '');
      html = html.replace(`/yuewen/article/${id}`, `/article/${_id}`);
      html = html.replace('http://10.68.100.51', '');
    }
    var res = await Article.findByIdAndUpdate({ _id: row._id }, { markdown, html }, { new: true }).exec();
  }

  // 读取文章点赞
  var [rows, fields] = await connection.execute('SELECT * FROM mooc_blike');
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    var like = {
      user: users[row['uid']],
      article: articles[row['bid']],
      created_at: row['datetime'] ? parseInt(new Date(row['datetime']).getTime()/1000) : parseInt(new Date().getTime()/1000),
    };
    var l = new Like(like);
    var res = await l.save();
  }

  // 评论
  var [rows, fields] = await connection.execute('SELECT * FROM mooc_comment ORDER BY DATETIME');
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    var comment = {
      author: users[row['uid']],
      atuser: users[row['atid']],
      article: articles[row['bid']],
      content: row['content'],
      created_at: row['datetime'] ? parseInt(new Date(row['datetime']).getTime()/1000) : parseInt(new Date().getTime()/1000),
      likes_count: row['likenum'],
      rid: row['rid'] === 0 ? '000000000000000000000000' : comments[row['rid']],
      reply_to_author: row['rid'] === 0 ? '000000000000000000000000' : users[row['atid']],
    };
    var c = new Comment(comment);
    var res = await c.save();
    comments[row['cid']] = res._id;
  }

  // 评论点赞
  var [rows, fields] = await connection.execute('SELECT * FROM mooc_mlike');
  for (var i = 0; i < rows.length; i++) {
    let row = rows[i];
    var like = {
      user: users[row['uid']],
      comment: comments[row['cid']],
      created_at: parseInt(new Date().getTime()/1000),
    };
    var l = new Like(like);
    await l.save();
  }
}

main();
