var User = require('../server/models/user');
var Article = require('../server/models/article');

var users = require('./users');
var { html, markdown, excerpt } = require('./articles');

// 写入 users
users.map(async item => {
  var user = {
    login: item.login,
    name: item.name,
    password: "e10adc3949ba59abbe56e057f20f883e",
    mail: item.mail,
    avatar_url: "/uploads/avatar/26566442.png",
    small_avatar_url: "/uploads/avatar/26566442_50.png",
    followed_topics: [ "javascript", "css", "python", "html", "qos" ],
    prestige : 20000,
    banner_url: "/uploads/banner/1519282508481.jpg",
    bio: item.bio,
    state : true,
    admin : true,
    created_at : parseInt(new Date().getTime()/1000),
  };
  var user = new User(user);
  var result = await user.save();
  var uid = result._id;

  for (var i = 0; i < 20; i++) {
    var article = {
      author: uid,
      title: "悦文，一个能说会道的博客",
      topics: [ "javascript", "css" ],
      excerpt,
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      created_at: parseInt(new Date().getTime()/1000),
      updated_at: parseInt(new Date().getTime()/1000),
      markdown,
      html,
      heat: 0
    };
    var article = new Article(article);
    await article.save();
  }
});
