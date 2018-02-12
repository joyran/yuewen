/**
 * 文章收藏 model, 数据表 stars
 */

// 从 mongoose.js 中导出 mongoose, Schema 两个变量
var { mongoose, Schema } = require('../utils/mongoose');

var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  createAt: String
}, { versionKey: false });

var Collection = mongoose.model('Collection', schema);

module.exports = Collection;
