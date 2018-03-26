/**
 * 导出 Like model，对应集合为 likes
 * 包括文章点赞和评论点赞
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  created_at: String
}, { versionKey: false });

var Like = mongoose.model('Like', schema);

module.exports = Like;
