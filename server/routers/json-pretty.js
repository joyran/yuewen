/**
 * API 返回的 json 数据格式化美化输出
 * @param ctx
 * @param status 状态码
 * @param body 内容
 */
const jsonPretty = (ctx, status, body) => {
  ctx.status = status;
  // 把 body json格式转换为字符串，缩进为两个空格
  const str = JSON.stringify(body, null, "  ");
  // 由于 str 是字符串,默认Content-Type是 text/plain，需要设置为application/json
  ctx.type = 'application/json; charset=utf-8';
  ctx.body = str;
}

module.exports = jsonPretty;
