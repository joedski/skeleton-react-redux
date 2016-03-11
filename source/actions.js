// @flow

// Flow type for Flux Standard Action.
export type Action = {
	type :string,
	payload? :?any,
	meta? :?any,
	error? :boolean
};

// Simple function which creates a Flux Standard Action.
// https://github.com/acdlite/flux-standard-action
function action( type, payload, meta = {} ) :Action {
	let actionObject :Action = { type, payload, meta };

	if( payload instanceof Error ) {
		actionObject.error = true;
	}

	return actionObject;
}

// Simple addition to the above to attach extra props to the error object.
// https://github.com/acdlite/flux-standard-action#error
function errorAction( type, errorPayload, errorProps, meta = {} ) :Action {
	Object.assign( errorPayload, errorProps );
	return action( type, errorPayload, meta );
}

export const INCREMENT = 'INCREMENT';
export const increment :(() => Action) = () => action( INCREMENT );

export const DECREMENT = 'DECREMENT';
export const decrement :(() => Action) = () => action( DECREMENT );
