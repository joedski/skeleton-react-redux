// @flow

import { combineReducers } from 'redux';
import * as actions from '../actions';

type CountState = number;

function count( state :CountState = 0, action :actions.Action ) :CountState {
	switch( action.type ) {
		case actions.INCREMENT: {
			return state + 1;
		}

		case actions.DECREMENT: {
			return state - 1;
		}

		default: return state;
	}
}

// With this, our state looks like this: { count: 0 }.
// To see this in action run the app in your browser and watch the console.
// See this part of the Rudux tutorial for more. http://redux.js.org/docs/basics/Reducers.html
export const app = combineReducers({ count });
