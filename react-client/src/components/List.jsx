import React from 'react';
import ListItem from './ListItem.jsx';

const List = (props) => (
  <div>
    <div className="yelp-list">
      { props.items.map(item => <ListItem handleClick={props.handleClick} item={item}/>)}
    </div>
  </div>
);

export default List;