import { useMemo } from 'preact/hooks';

import { useQuery } from './query.js';
import { stringify } from './utils.js';


export function useResourceQuery (options) {
	return useMemo(() => {
		const opts = { ...options, suspense: true };
		return createResource(() => useQuery(opts).data);
	}, [stringify(options)]);
}

function createResource (read) {
	return { read };
}
