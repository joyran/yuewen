/**
 * 标签导航
 */

import { connect } from 'react-redux';
import stylesheet from './index.scss';

const TagNav = (props) => {
  return (
    <div className="tag-nav">
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      <ul>
        {props.digest.activeTag ?
          <li key="new"><a href="/">new</a></li> :
          <li className="active-tag" key="new"><a href="/">new</a></li>
        }
        {
          props.session.followedTags.map((tag) => {
            return (
              props.digest.activeTag === tag ?
                <li className="active-tag" key={tag}><a href={`/tag/${tag}`}>{tag}</a></li> :
                <li key={tag}><a href={`/tag/${tag}`}>{tag}</a></li>
            );
          })
        }
      </ul>
    </div>
  );
};

export default connect(state => state)(TagNav);
