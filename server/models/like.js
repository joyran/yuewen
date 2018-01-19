/**
 * 导出 Like model，对应集合为 likes
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  createAt: String
}, { versionKey: false });

var Like = mongoose.model('Like', LikeSchema);

module.exports = Like;
