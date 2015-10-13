var React = require('react/addons');

module.exports = React.createClass({
	render: function() {
		return (
			<li>{ this.props.item.name }</li>
		)
	}
});