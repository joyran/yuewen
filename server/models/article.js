/**
 * 导出 Article model，对应集合为 articles
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  tags: Array,
  excerpt: String,
  views_count: Number,
  comments_count: Number,
  likes_count: Number,
  created_at: String,
  updated_at: String,
  markdown: String,
  html: String,
  heat: Number
}, { versionKey: false });

var Article = mongoose.model('Article', schema);

module.exports = Article;
