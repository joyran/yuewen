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
- 个人设置
- 个人主页  [已完成]
- 我的收藏  [已完成]

- 低：写文章篇幅过大时性能卡顿

# 全文检索配置

## Elasticsearch
1. 下载 [Elasticsearch](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.2.1.msi)
2. 访问 http://localhost:9200/

## Kibana
1. 下载 [Kibana](https://artifacts.elastic.co/downloads/kibana/kibana-6.2.1-windows-x86_64.zip)
2. 双击 `\bin\kibana.bat` 启动服务, 访问 http://localhost:5601/

## mongo-connector
1. pip install mongo-connector -i https://pypi.douban.com/simple
2. pip install elastic2-doc-manager -i https://pypi.douban.com/simple
3. pip install elastic-doc-manager[elastic2] -i https://pypi.douban.com/simple
4. pip install elastic-doc-manager[elastic5] -i https://pypi.douban.com/simple
5. mongo-connector -m localhost:27017 -t localhost:9200 -d elastic2_doc_manager
