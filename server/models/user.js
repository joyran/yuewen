/**
 * 导出 User model，对应集合为 users
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var userSchema = new Schema({
  username: String,
  password: String,
  mail: String,
  avatar: String,
  smAvatar: String,
  followedTags: Array,
  prestige: Number,
  banner: String,
  bio: String,
  state: Boolean,
  isAdmin: Boolean,
  createAt: String
}, { versionKey: false });

var User = mongoose.model('User', userSchema);

module.exports = User;
