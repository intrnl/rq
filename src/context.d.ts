import { VNode, ComponentChildren } from 'preact';

import { Query } from './query';


declare type Promisable<T> = T | Promise<T>;

export declare type QueryKey = string | readonly unknown[];
export declare type EnsuredQueryKey<T extends QueryKey> = T extends string ? [T] : T;

export declare type QueryFunction<D, K extends QueryKey = QueryKey> = (...params: EnsuredQueryKey<K>) => Promisable<D>;

export declare type QueryCache = Map<string, Query<any>>;

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

export declare const defaultQueryOptions: QueryContextOptions;

export declare function useQueryConfig (): QueryContextOptions;
export declare function QueryProvider (props: QueryProviderProps): VNode<any>;
