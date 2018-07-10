/**
 * 导出 Topic model，对应集合为 topics
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var schema = new Schema({
  topic: String,
  followers_count: Number,
  articles_count: Number,
  description: String,
  avatar_url: String
}, { versionKey: false });

var Topic = mongoose.model('Topic', schema);

module.exports = Topic;
