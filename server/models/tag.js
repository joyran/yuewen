/**
 * 导出 Tag model，对应集合为 tags
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var tagSchema = new Schema({
  tag: String,
  followers: Number,
  articles: Number,
  description: String
}, { versionKey: false });

var Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
