console.log('JSX browserified!');

var React = require('react/addons');
var UsersList = require('./components/UsersList.jsx');

var initial = [
	{ name: "John Doe" },
	{ name: "Jake Doe" },
	{ name: "Jane Doe", selected: true },
	{ name: "Jolly Doe" },
	{ name: "Jim Doe", selected: true },
	{ name: "Jam Doe" }
];

React.render(<UsersList items={ initial } />, app);