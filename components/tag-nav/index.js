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
  const { followedTags } = props.session;
  const { loading, hasMore } = props.excerpt;

  const onChangeTag = (key) => {
    props.dispatch(changeTag(key));
    props.dispatch(readExcerptsByTag());
  };

  const handleInfiniteOnLoad = () => {
    if (!loading) {
      props.dispatch(readExcerptsByTag());
    }
  };

  return (
    <div className="tag-nav">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <Tabs
        defaultActiveKey="hot"
        onChange={onChangeTag}
        animated={false}
      >
        {
          followedTags.map((tag) => {
            return (
              <TabPane tab={tag} key={tag}>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={0}
                  loadMore={handleInfiniteOnLoad}
                  hasMore={!loading && hasMore}
                  useWindow
                >
                  <ExcerptList dataSource={props.excerpt.dataSource} loading={loading} />
                  { loading && hasMore && <Card loading bordered={false} style={{ width: '100%' }}>BL</Card> }
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
