import { useEffect, useReducer } from 'preact/hooks';
import { stableStringify } from '@intrnl/stable-stringify';

import { useQueryConfig } from './context.js';
import { listenFocusChange } from './focus.js';


export function useQuery (options) {
	options = { ...useQueryConfig(), ...options };

	const {
		key,
		fetch,
		disabled,

		cache,

		staleTime,
		cacheTime,
		revalidateOnMount,
		revalidateOnFocus,

		structuralSharing,

		suspense,
		errorBoundary,
	} = options;

	const forceUpdate = useForceUpdate();

	const hash = stableStringify(key);
	let query = cache.get(hash);

	if (!query) {
		query = new Query();
		cache.set(hash, query);
	}

	const revalidate = async () => {
		const curr = query.state;

		if (disabled || (!curr.invalidated && curr.updated && (Date.now() - curr.updated < staleTime))) {
			return;
		}

		return query.promise ||= (async () => {
			query.update((prev) => ({ ...prev, fetching: true }));

			try {
				const data = await fetch(...(Array.isArray(key) ? key : [key]));

				query.update((prev) => ({
					...prev,
					status: 'success',
					data: structuralSharing
						? shareStructural(prev.data, data)
						: stableStringify(prev.data) === stableStringify(data) ? prev.data : data,
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

		if (!disabled && revalidateOnMount) {
			revalidate();
		}

		return () => {
			unsubscribe();

			if (!query.listeners.length) {
				// with `errorBoundary` enabled, errors are thrown immediately to be
				// caught by error boundaries. Rather than having to manually reset
				// the queries thrown that way, it might be better if we just dispose
				// of them immediately.

				// This doesn't handle cases where you have users with both the option
				// enabled and disabled, but at that point you might want to invalidate
				// them manually.

				const timeout = errorBoundary && query.state.status === 'error'
					? 25
					: cacheTime;

				query.timeout = setTimeout(() => cache.delete(hash), timeout);
			}
		};
	}, [query]);

	useEffect(() => {
		if (disabled || !revalidateOnFocus) {
			return;
		}

		return listenFocusChange(revalidate);
	}, [disabled, query, revalidateOnFocus]);


	const state = query.state;
	const status = state.status;
	const invalidated = state.invalidated;

	if (!disabled) {
		if (suspense) {
			if (status === 'loading' || (status === 'error' && invalidated)) {
				throw revalidate();
			}
		}

		if (invalidated && !state.fetching) {
			revalidate();
		}
	}

	if (errorBoundary && status === 'error') {
		throw state.error;
	}

	return { ...state, mutate, revalidate };
}

export function mutateQuery (cache, key, data, invalidate = true) {
	const exists = data != null;

	const hash = stableStringify(key);
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

export function invalidateQueries (cache, keys) {
	const array = Array.isArray(keys);

	const all = !keys.length;
	const hashEnd = stableStringify(keys);
	const hashTrail = hashEnd.slice(0, -1) + ',';

	for (const [key, query] of cache) {
		const match = (array && (all || key.startsWith(hashTrail))) || key === hashEnd;

		if (match) {
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

// Structural sharing
function shareStructural (a, b) {
	if (a === b) {
		return a;
	}

	let arr = isArray(a) && isArray(b);
	let obj =	isPlainObject(a) && isPlainObject(b);

	if (arr || obj) {
    const bItems = arr ? b : Object.keys(b);

    const aSize = arr ? a.length : Object.keys(a).length;
    const bSize = bItems.length;

		const copy = arr ? [] : {};

    let equalItems = 0;

    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i]
      copy[key] = shareStructural(a[key], b[key])

      if (copy[key] === a[key]) {
        equalItems++
      }
    }

    return aSize === bSize && equalItems === aSize ? a : copy
	}

	return b;
}

function isArray (value) {
	return Array.isArray(value);
}

function isPlainObject (value) {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}

// useForceUpdate
function useForceUpdate () {
	return useReducer(updateReducer)[1];
}

function updateReducer () {
	return {};
}
