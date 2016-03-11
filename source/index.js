// Elevate ES3 environments.
import 'core-js';
import 'console-polyfill';
import 'html5shiv';



//// Demonstrate your current store to the console.
// Note: This is good as a smoketest, but should ideally be something in a test file
// off to the side once you begin writing your app in earnest.

// import { createStore, applyMiddleware } from 'redux';
// import reduxThunk from 'redux-thunk';
// import createReduxLogger from 'redux-logger';

// import { app as appReducer } from './reducers';
// import * as actions from './actions';

// let logger = createReduxLogger();

// let store = createStore(
// 	appReducer,
// 	applyMiddleware( reduxThunk, logger )
// );

// store.dispatch( actions.increment() );
// store.dispatch( actions.decrement() );



//// Actually render the app.

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import createReduxLogger from 'redux-logger';

import App from './components/app';
import { app as appReducer } from './reducers';

// Example logger if we used ImmutableJS for just the subparts of the state.
// let logger = createReduxLogger({
// 	stateTransformer( state ) {
// 		let statePOJO = {};
// 		Object.keys( state ).forEach( sname => statePOJO[ sname ] = state[ sname ].toJS() );
// 		statePOJO.__immutable = state;
// 		return statePOJO;
// 	}
// });

let logger = createReduxLogger();

let store = createStore(
	appReducer,
	applyMiddleware( reduxThunk, logger )
);

render(
	<Provider store={ store }>
		<App/>
	</Provider>,
	document.getElementById( 'app-root' )
);
