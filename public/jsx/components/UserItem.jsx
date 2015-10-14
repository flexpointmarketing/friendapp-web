var React = require('react/addons');

module.exports = React.createClass({
	render: function() {
		return (
			<li>
				<h4 className={this.props.item.selected ? "strikethrough" : ""}>
					{ this.props.item.name }
				</h4>
			</li>
		)
	}
});