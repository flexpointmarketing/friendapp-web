console.log('JSX browserified');

var React = require('react/addons');
var UsersList = require('./components/UsersList.jsx');

React.render(<UsersList />, app);