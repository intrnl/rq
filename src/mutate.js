import { useCallback } from 'preact/hooks';

import { useQueryConfig } from './context.js';
import { mutateQuery, invalidateQueries } from './query.js';


export const useMutate = (options) => {
	options = { ...useQueryConfig(), ...options };

	const { cache } = options;

	return useCallback((key, data, invalidate) => (
		mutateQuery(cache, key, data, invalidate)
	), [cache]);
};

export const useInvalidate = (options) => {
	options = { ...useQueryConfig(), ...options };

	const { cache } = options;

	return useCallback((keys) => (
		invalidateQueries(cache, keys)
	), [cache]);
};
