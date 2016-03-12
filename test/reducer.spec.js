import expect from 'expect';
import deepFreeze from 'deep-freeze';
import { app as appReducer } from '../source/reducers';
import * as actions from '../source/actions';

describe( 'reducer', () => {
	it( `should provide the initial state`, () => {
		expect( appReducer( undefined, {} ) )
			.toEqual( { count: 0 } )
			;
	});

	it( `should handle INCREMENT actions`, () => {
		const stateBefore = {
			count: 0
		};

		const stateAfter = {
			count: 1
		};

		const action = actions.increment();

		deepFreeze( stateBefore );
		deepFreeze( action );

		expect( appReducer( stateBefore, action ) ).toEqual( stateAfter );
	});

	it( `should handle DECREMENT actions`, () => {
		const stateBefore = {
			count: 0
		};

		const stateAfter = {
			count: -1
		};

		const action = actions.decrement();

		deepFreeze( stateBefore );
		deepFreeze( action );

		expect( appReducer( stateBefore, action ) ).toEqual( stateAfter );
	});
});
