import React from 'react';

const ListItem = (props) => (
	<div className="yelp-list-entry-container">
		<div className="yelp-list-entry">
			<div className="media-left media-middle">
				<img className="listing-object" src={ props.item.image_url } alt="" />
			</div>
			<div className="listing-body">
				<div className="yelp-list-entry-name" onClick={ (e)=> props.handleClick(props.item) }>{ props.item.name }</div>
				<div className="yelp-list-entry-rating">{ 'Rating: ' + props.item.rating }</div>
				<div className="yelp-list-entry-price">{ 'Price: ' + props.item.price }</div>
				<div className="yelp-list-entry-reviews">{ 'Reviews: ' + props.item.review_count }</div>
				<div className="yelp-list-entry-address">{ 'Address: ' + props.item.location.address1 }</div>
			</div>
		</div>
	</div>
)

export default ListItem;