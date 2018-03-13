/**
 * 导出 Comment model，对应集合为 comments
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var commentSchema = new Schema({
  cid: Number,    // comment id
  author: { type: Schema.Types.ObjectId, ref: 'User' },    // 评论原作者，映射到 users _id
  atuser: { type: Schema.Types.ObjectId, ref: 'User' },   // 被@的用户，映射到 users _id
  cid: { type: Schema.Types.ObjectId, ref: 'Comment' },    // 被回复的 comment id
  article: { type: Schema.Types.ObjectId, ref: 'Article' },    // 评论关联的文章 aid
  comment: String,    // 评论内容
  created_at: String    // 创建时间戳
}, { versionKey: false });

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
