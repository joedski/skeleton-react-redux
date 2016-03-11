import React, { PropTypes } from 'react';
import CurrentCount from './current-count';

// The root container of our app, should just lay out the main sections of it.

const App = () => (
	<div className="app">
		<CurrentCount />
	</div>
);

export default App;
