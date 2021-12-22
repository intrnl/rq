import { VNode, ComponentChildren } from 'preact';

import { Query } from './query';


type Promisable<T> = T | Promise<T>;

export type QueryKey = string | readonly unknown[];
export type EnsuredQueryKey<T extends QueryKey> = T extends string ? [T] : T;

export type QueryFunction<D, K extends QueryKey = QueryKey> = (...params: EnsuredQueryKey<K>) => Promisable<D>;

export type QueryCache = Map<string, Query<any>>;

export interface QueryContextOptions<D = unknown, K extends QueryKey = QueryKey> {
	fetch?: QueryFunction<D, K>;

	cache?: QueryCache;

	staleTime?: number;
	cacheTime?: number;
	revalidateOnMount?: boolean;
	revalidateOnFocus?: boolean;

	isDataEqual?: (prev: D | null, next: D) => D,

	suspense?: boolean;
	errorBoundary?: boolean;
}

export interface QueryProviderProps {
	value: QueryContextOptions;
	children: ComponentChildren;
}

export const defaultQueryOptions: QueryContextOptions;

export function useQueryConfig (): QueryContextOptions;
export function QueryProvider (props: QueryProviderProps): VNode<any>;
