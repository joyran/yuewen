/**
 * 通知 notice model
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var schema = new Schema({
  atuser: { type: Schema.Types.ObjectId, ref: 'User' },  // 被通知人 id
  content: String,    // 通知内容
  link_url: String,   // 点击通知消息后跳转的链接
  title: String,
  initiator: { type: Schema.Types.ObjectId, ref: 'User' },  // 通知发起者
  has_view: Boolean,    // 是否已读
  type: String,   // comment 或者 like
  created_at: String
}, { versionKey: false });

var Notice = mongoose.model('Notice', schema);

module.exports = Notice;
