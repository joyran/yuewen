# 启动 mongod 服务器
```
mongod --dbpath f:/mongodb/data/db --replSet rs0 --auth
```

# 开始使用

```
npm run dev   -- 开发环境
npm start     -- 生产发布环境
```

# 代办事项

- 搜索
- 消息通知
  - 消息卡片，查看新消息 [已完成]
  - 评论和点赞时生成新消息 [已完成]
  - notice页面，查看所有消息 [已完成]
  - 生成新消息时邮件通知
- 更新文章  [已完成]
- 标签管理
- 文章管理  [已完成]
- 个人设置  [已完成] 完成头像上传裁剪压缩，完成封面图上传裁剪压缩，剩余个人资料编辑
- 个人主页  [已完成]
- 我的收藏  [已完成]

- 低：写文章篇幅过大时性能卡顿

# 全文检索配置

## Elasticsearch
目前 mongo-connector 还不支持 elasticsearch 6.x，故使用 5.5.1版本
1. 下载 [Elasticsearch](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.5.1.zip)
2. 下载中文分词器`ik`, elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v5.5.1/elasticsearch-analysis-ik-5.5.1.zip
2. 解压后进入到 bin 目录，双击 elasticsearch.bat 运行
3. 打开浏览器访问 http://localhost:9200/

## Kibana
1. 下载 [Kibana](https://artifacts.elastic.co/downloads/kibana/kibana-5.5.1-windows-x86.zip)
2. 双击 `\bin\kibana.bat` 启动服务, 访问 http://localhost:5601/
3. 新建索引 yue, 并设置 type 为 articles，设置字段 markdown 和 title 分词器为 ik_max_word
```
PUT yue
{
	"mappings": {
		"articles": {
		  "properties": {
  			"markdown": {
  			  "type": "text",
  			  "analyzer": "ik_max_word",
  			  "search_analyzer": "ik_max_word"
  			},
  			"title": {
  			  "type": "text",
  			  "analyzer": "ik_max_word",
  			  "search_analyzer": "ik_max_word"
  			}
		  }
		}
	}
}
```

4. 验证分词器 ik 是否设置成功
```
GET _analyze?pretty&analyzer=ik_max_word
{
  "text": ["联想是全球最大的笔记本厂商"]
}
```

## mongo-connector
1. pip install mongo-connector -i https://pypi.douban.com/simple
2. pip install elastic2-doc-manager -i https://pypi.douban.com/simple
3. pip install elastic-doc-manager[elastic2] -i https://pypi.douban.com/simple
4. pip install elastic-doc-manager[elastic5] -i https://pypi.douban.com/simple
5. mongo-connector -m localhost:27017 -t localhost:9200 -d elastic2_doc_manager -n yue.articles
