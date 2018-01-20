/**
 * 导出 Article model，对应集合为 articles
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var articleSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  tags: Array,
  digest: String,
  views: Number,
  comments: Number,
  likes: Number,
  createAt: String,
  updateAt: String,
  markdown: String,
  markup: String,
  heat: Number
}, { versionKey: false });

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;