/**
 * 个人主页内容
 */

import { Tabs, Card } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import ExcerptList from '../excerpt-list/index';
import { readExcerptsByUserCreated, readExcerptsByUserCollected, changeTag } from '../../reducers/excerpt';

const TabPane = Tabs.TabPane;
// 时间汉化
moment.locale('zh-cn');

const ProfileContent = (props) => {
  const { loading, hasMore } = props.excerpt;

  const onChangeTag = (key) => {
    props.dispatch(changeTag(key));
    if (key === 'created') {
      props.dispatch(readExcerptsByUserCreated());
    } else {
      props.dispatch(readExcerptsByUserCollected());
    }
  };

  return (
    <div className="profile-content">
      <Tabs defaultActiveKey="created" onChange={onChangeTag} animated={false}>
        <TabPane tab={`文章 ${props.excerpt.totalCreated}`} key="created">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !loading && hasMore && props.dispatch(readExcerptsByUserCreated()); }}
            hasMore={!loading && hasMore}
            useWindow
          >
            <ExcerptList dataSource={props.excerpt.dataSource} loading={loading} />
            { loading && hasMore && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
        <TabPane tab={`收藏 ${props.excerpt.totalCollected}`} key="collected">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !loading && hasMore && props.dispatch(readExcerptsByUserCollected()); }}
            hasMore={!loading && hasMore}
            useWindow
          >
            <ExcerptList dataSource={props.excerpt.dataSource} loading={loading} />
            { loading && hasMore && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default connect(state => state)(ProfileContent);
