/**
 * 导出 User model，对应集合为 users
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var schema = new Schema({
  login: String,
  name: String,
  password: String,
  mail: String,
  avatar_url: String,
  small_avatar_url: String,
  followed_topics: Array,
  prestige: Number,
  banner_url: String,
  bio: String,
  state: Boolean,
  admin: Boolean,
  created_at: String
}, { versionKey: false });

var User = mongoose.model('User', schema);

module.exports = User;
