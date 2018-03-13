/**
 * 标签导航
 */

import { Tabs, Card } from 'antd';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import ExcerptList from '../excerpt-list/index';
import { readExcerptsByTag, changeTag } from '../../reducers/excerpt';
import stylesheet from './index.scss';

const TabPane = Tabs.TabPane;

const TagNav = (props) => {
  const { followed_tags } = props.session;
  const { loading } = props.excerpt;

  const onChangeTag = (key) => {
    props.dispatch(changeTag(key));
    props.dispatch(readExcerptsByTag());
  };

  return (
    <div className="tag-nav">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <Tabs
        defaultActiveKey="new"
        onChange={onChangeTag}
        animated={false}
      >
        {
          followed_tags.map((tag) => {
            return (
              <TabPane tab={tag} key={tag}>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={0}
                  loadMore={() => { !loading && props.excerpt.has_more && props.dispatch(readExcerptsByTag()); }}
                  hasMore={!loading && props.excerpt.has_more}
                  useWindow
                >
                  <ExcerptList dataSource={props.excerpt.excerpts} loading={loading} />
                  { loading && props.excerpt.has_more && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
                </InfiniteScroll>
              </TabPane>
            );
          })
        }
      </Tabs>
    </div>
  );
};

export default connect(state => state)(TagNav);
