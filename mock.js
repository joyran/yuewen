// mongodb 调试文件

var fs = require('fs')

var Article     = require('./server/models/article')

var articles = fs.readFileSync('./mooc_article.json').toString()
var articles = JSON.parse(articles)

articles.map((item) => {
  var article = {
    author: "5944ee2501a2a6e7624213f7",
    title: item.title,
    excerpt: item.digest,
    views: item.viewnum,
    likes: item.likenum,
    comments: item.commnum,
    createAt: new Date(item.datetime).getTime()/1000,
    updateAt: new Date(item.update_datetime).getTime()/1000,
    markdown: item.markdown,
    markup: item.markup,
    heat: 0,
    tags: []
  };
  var n = new Article(article)
  var result = n.save()
})
