import { h, createContext } from 'preact';
import { useContext, useMemo } from 'preact/hooks';


export const defaultQueryOptions = {
	cache: new Map(),

	staleTime: 3 * 1000,
	cacheTime: 5 * 60 * 1000,
	revalidateOnMount: true,
	revalidateOnFocus: true,
};

const QueryContext = createContext(defaultQueryOptions);

export function useQueryConfig () {
	return useContext(QueryContext);
}

export function QueryProvider (props) {
	const { options: next, children } = props;

	const prev = useQueryConfig();

	const mergedOptions = useMemo(
		() => ({ ...prev, ...next }),
		[next],
	);

	return h(QueryContext.Provider, { value: mergedOptions, children });
}
