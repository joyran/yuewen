/**
 * 个人主页内容
 */

import { Tabs, Card } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import ExcerptList from '../excerpt-list/index';
import { readExcerptsByUser, changeTag } from '../../reducers/excerpt';

const TabPane = Tabs.TabPane;
// 时间汉化
moment.locale('zh-cn');

const ProfileContent = (props) => {
  const onChangeTag = (key) => {
    props.dispatch(changeTag(key));
    props.dispatch(readExcerptsByUser(props.profile.login, key));
  };

  return (
    <div className="profile-content">
      <Tabs defaultActiveKey="create" onChange={onChangeTag} animated={false}>
        <TabPane tab={`文章 ${props.excerpt.excerpts_created_count}`} key="create">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.excerpt.loading && props.excerpt.has_more && props.dispatch(readExcerptsByUser(props.profile.login)); }}
            hasMore={!props.excerpt.loading && props.excerpt.has_more}
            useWindow
          >
            <ExcerptList data={props.excerpt.data} loading={props.excerpt.loading} />
            { props.excerpt.loading && props.excerpt.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
        <TabPane tab={`收藏 ${props.excerpt.excerpts_collected_count}`} key="collect">
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={() => { !props.excerpt.loading && props.excerpt.has_more && props.dispatch(readExcerptsByUser(props.profile.login)); }}
            hasMore={!props.excerpt.loading && props.excerpt.has_more}
            useWindow
          >
            <ExcerptList data={props.excerpt.data} loading={props.excerpt.loading} />
            { props.excerpt.loading && props.excerpt.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
          </InfiniteScroll>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default connect(state => state)(ProfileContent);
