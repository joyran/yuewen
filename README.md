# 悦文
一个能说会道的博客，支持 Markdown 写文章，还可以评论收藏。为了追求新技术，踩了不少坑，还好没放弃，差点就放弃了。前端采用 React + React-Router + React-Redux，后端抛弃 php，采用 Node.js，框架选用 Koa2 + Next.js，数据库采用 Mongodb，全文检索采用 Elasticsearch，API 完全符合 RESTful 设计风格。

## 环境准备
- MongoDB   v3.4.5
- Node.js   v8.1.0
- Elasticsearch v5.5.1

### Elasticsearch
1. 下载 [Elasticsearch](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.5.1.zip)
2. 下载中文分词器`ik`, elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v5.5.1/elasticsearch-analysis-ik-5.5.1.zip
3. 解压后进入到 bin 目录，双击 elasticsearch.bat 运行
4. 打开浏览器访问 http://localhost:9200/ 查看是否启动成功
5. 新建索引 yue, 并设置 type 为 articles，设置字段 markdown 和 title 分词器为 ik_max_word
```
PUT /yue
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
    },
    "users": {
      "properties": {
        "name": {
          "type": "text",
          "analyzer": "ik_max_word",
          "search_analyzer": "ik_max_word"
        }
      }
    }
  }
}
```

### mongo-connector
```
1. pip install mongo-connector -i https://pypi.douban.com/simple
2. pip install elastic2-doc-manager -i https://pypi.douban.com/simple
3. pip install elastic-doc-manager[elastic2] -i https://pypi.douban.com/simple
4. pip install elastic-doc-manager[elastic5] -i https://pypi.douban.com/simple
```

### 启动 MongoDB 服务器
创建 MongoDB 数据存储目录 `f:/mongodb/data/db`
```
mongod --dbpath f:/mongodb/data/db --replSet rs0 --auth
```

### 同步 MongoDB 数据库 yue 下所有表格到 elasticsearch
```
mongo-connector -m localhost:27017 -t localhost:9200 -d elastic2_doc_manager -n yue.*
```

### 安装依赖
```
npm install
```

### mock 数据
```
npm run mock
```

### 开发调试
```
npm run dev
```

### 生产发布
```
npm run build -- 打包
npm start     -- 启动
```

## RESTful API
### 成功返回值
http 状态码有以下几种
- 200： [GET] 服务器成功返回用户请求的数据
- 201： [POST/PUT/PATCH] 用户新建或修改数据成功
- 204： [DELETE] 用户删除数据成功

```json
{
  "username": "joy",
  "email": "joy@example.com"
}
```

### 失败返回值
http 状态码有以下几种
- 404： 用户发出的请求针对的是不存在的记录，服务器没有进行操作
- 401： 用户没有权限, 如未登录
- 403： 用户已经得到授权，但没有权限访问指定资源
- 500： 服务器错误

```json
{
  "message": "错误消息",
  "error": "详细错误信息，可选"
}
```

## TODO
1. [已解决] 个人主页切换到【文章】tab，向下滚动不加载用户发表的文章，而是加载用户收藏的文章
2. [已解决] 火狐和 Edge 浏览器打不开写文章页面
3. [已解决] 标签管理
4. 编辑个人资料
