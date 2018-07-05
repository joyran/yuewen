/**
 * 个人主页内容
 */
import { connect } from 'react-redux';
import { Tabs, Card, Button } from 'antd';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import { changeTab, searchArticle, searchUser } from '../../reducers/search';
import stylesheet from './index.scss';

const TabPane = Tabs.TabPane;
// 时间汉化
moment.locale('zh-cn');

const Index = (props) => {
  const onChange = (key) => {
    switch (key) {
      case 'article':
        props.dispatch(changeTab());
        props.dispatch(searchArticle());
        break;

      case 'user':
        props.dispatch(changeTab());
        props.dispatch(searchUser());
        break;

      default:
        break;
    }
  };

  return (
    <div className="wrapper">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <Tabs defaultActiveKey="article" onChange={onChange} animated={false}>
        <TabPane tab="文章" key="article">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.search.loading && props.search.articles.has_more && props.dispatch(searchArticle(props.search.query)); }}
            hasMore={!props.search.loading && props.search.articles.has_more}
            useWindow
          >
            <ul>
              { props.search.articles.data.map((item, index) => {
                // 文章标题默认从 highlight 中读取，如果 highlight 中没有则从 _source 中读取
                const title = item.highlight.title ? item.highlight.title[0] : item._source.title;

                // 文章摘要默认从 highlight 中读取，如果 highlight 中没有则从 _source 中读取
                const markdown = item.highlight.markdown ? item.highlight.markdown[0] : item._source.excerpt;
                // replace 删除摘要中 # 和空格
                const excerpt = markdown.replace(/[#\s]/g, '');
                return (
                  <li key={index} className="article-item">
                    <a href={`/article/${item._id}`} target="_blank">
                      <p className="article-title" dangerouslySetInnerHTML={{ __html: title }} />
                      <p className="article-excerpt" dangerouslySetInnerHTML={{ __html: excerpt }} />
                    </a>
                  </li>
                );
              }) }
              { props.search.articles.data.length === 0 && !props.search.loading ?
                <div className="search-not-found">
                  <img src="/imgs/search.svg" alt="暂无搜索结果" />
                  <p>暂无搜索结果</p>
                </div> : ''
              }
            </ul>
            { props.search.loading && props.search.articles.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
        <TabPane tab="用户" key="user">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.search.loading && props.search.users.has_more && props.dispatch(searchUser(props.search.query)); }}
            hasMore={!props.search.loading && props.search.users.has_more}
            useWindow
          >
            <ul>
              { props.search.users.data.map((item, index) => {
                return (
                  <li className="user-item" key={index}>
                    <a
                      href={`/user/${item._source.login}`}
                      className="user-item-link"
                    >
                      <img
                        alt={item._source.name}
                        src={item._source.avatar_url}
                        className="user-item-avatar"
                      />
                    </a>
                    <div className="user-item-content">
                      <a
                        className="user-item-content-username"
                        href={`/user/${item._source.login}`}
                        dangerouslySetInnerHTML={{ __html: item.highlight.name[0] }}
                      />
                      <p className="user-item-content-bio">{item._source.bio}</p>
                    </div>
                    <Button type="primary" icon="plus" className="user-item-button">关注</Button>
                  </li>
                );
              }) }
              { props.search.users.data.length === 0 && !props.search.loading ?
                <div className="search-not-found">
                  <img src="/imgs/search.svg" alt="暂无搜索结果" />
                  <p>暂无搜索结果</p>
                </div> : ''
              }
            </ul>
            { props.search.loading && props.search.users.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default connect(state => state)(Index);
