import { useEffect, useReducer } from 'preact/hooks';

import { useQueryConfig } from './context.js';
import { listenFocusChange } from './focus.js';
import { stringify } from './utils.js';


export function useQuery (options) {
	options = { ...useQueryConfig(), ...options };

	const {
		key,
		fetch,

		cache,

		staleTime,
		cacheTime,
		revalidateOnMount,
		revalidateOnFocus,

		suspense,
	} = options;

	const forceUpdate = useForceUpdate();

	const hash = stringify(key);
	let query = cache.get(hash);

	if (!query) {
		query = new Query();
		cache.set(hash, query);
	}

	const revalidate = async () => {
		const curr = query.state;

		if (!curr.invalidated && curr.updated && (Date.now() - curr.updated < staleTime)) {
			return;
		}

		return query.promise ||= (async () => {
			query.update((prev) => ({ ...prev, fetching: true }));

			try {
				const data = await fetch(...(Array.isArray(key) ? key : [key]));

				query.update((prev) => ({
					...prev,
					status: 'success',
					data: stringify(prev.data) === stringify(data) ? prev.data : data,
					error: null,
					updated: Date.now(),
				}));
			}
			catch (error) {
				query.update((prev) => ({
					...prev,
					status: 'error',
					data: null,
					error: error,
					updated: null,
				}));
			}
			finally {
				query.promise = null;
				query.update((prev) => ({ ...prev, fetching: false, invalidated: false }));
			}
		})();
	};

	const mutate = (data, invalidate) => (
		mutateQuery(cache, key, data, invalidate)
	);

	useEffect(() => {
		const unsubscribe = query.subscribe(forceUpdate);
		clearTimeout(query.timeout);

		if (revalidateOnMount) {
			revalidate();
		}

		return () => {
			unsubscribe();

			if (!query.listeners.length) {
				// in Suspense mode, errors are immediately thrown and usually caught
				// by error boundaries. Rather than exposing a method to somehow reset
				// these queries, it might be better if we just clear it immediately.

				// This doesn't handle cases such as when you have both Suspense and
				// non-Suspense queries on the same key, but at that point you might
				// want to invalidate them manually.

				const timeout = suspense && query.state.status === 'error'
					? 0
					: cacheTime;

				query.timeout = setTimeout(() => cache.delete(hash), timeout);
			}
		};
	}, [query]);

	useEffect(() => {
		if (!revalidateOnFocus) {
			return;
		}

		const unsubscribeFocus = listenFocusChange(revalidate);
		return unsubscribeFocus;
	}, [query, revalidateOnFocus]);

	const state = query.state;

	const status = state.status;
	const invalidated = state.invalidated;

	if (suspense) {
		if (status === 'loading' || (status === 'error' && invalidated)) {
			throw revalidate();
		}
		else if (status === 'error') {
			throw state.error;
		}
	}

	if (invalidated && !state.fetching) {
		revalidate();
	}

	return { ...state, mutate, revalidate };
}

export function mutateQuery (cache, key, data, invalidate = true) {
	const exists = data != null;

	const hash = stringify(key);
	let query = cache.get(hash);

	if (!query) {
		// If we're only trying to force invalidate then there's not much we can
		// do here since it doesn't exist.
		if (!exists) {
			return;
		}

		// The assumption here is that these queries are guaranteed to be used
		// somewhere down the line, hence no garbage collection set up.
		query = new Query();
		cache.set(hash, query);
	}

	query.update((prev) => ({
		...prev,
		status: exists ? 'success' : prev.status,
		data: exists ? data : prev.data,
		error: exists ? null : prev.error,
		updated: exists ? Date.now() : prev.updated,
		invalidated: invalidate,
	}));
}

export function invalidateQueries (cache, keys, reverse) {
	const all = !keys.length;
	const hashEnd = stringify(keys);
	const hashTrail = hashEnd.slice(0, -1) + ',';

	for (const [key, query] of cache) {
		const check = all || key === hashEnd || key.startsWith(hashTrail);

		if (reverse ? !check : check) {
			query.update((prev) => ({ ...prev, invalidated: true }));
		}
	}
}


class Query {
	listeners = new Set();

	timeout;
	promise;

	state = {
		status: 'loading',
		data: null,
		error: null,
		updated: null,
		fetching: false,
		invalidated: false,
	};

	update (updater) {
		const prev = this.state;
		const next = updater(prev);

		this.state = next;
		this.notify();
	}

	subscribe (listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	notify () {
		for (const listener of this.listeners) {
			listener();
		}
	}
}


// useForceUpdate
function useForceUpdate () {
	return useReducer(updateReducer)[1];
}

function updateReducer () {
	return {};
}
