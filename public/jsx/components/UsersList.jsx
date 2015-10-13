var React = require('react/addons');
var UserItem = require('./UserItem.jsx');	

module.exports = React.createClass({
	render: function() {
		return (
			<div>
				<h1>Users List</h1>
				<ul>
					{this.props.items.map(function(item, index) {
						return (
							<UserItem item={item} key={"item"+index} />
						)	
					})}
				</ul>
			</div>
		)
	}
});