import { QueryContextOptions, QueryKey, QueryCache } from './context';


type Promisable<T> = T | Promise<T>;

export interface QueryLoadingState {
	status: 'loading';
	data: null;
	error: null;
	updated: null;
	fetching: boolean;
	invalidated: boolean;
}

export interface QuerySuccessState<T> {
	status: 'success';
	data: T;
	error: null;
	updated: number;
	fetching: boolean;
	invalidated: boolean;
}

export interface QueryErrorState {
	status: 'error';
	data: null;
	error: unknown;
	updated: null;
	fetching: boolean;
	invalidated: boolean;
}

export type QueryState<T> =
	| QueryLoadingState
	| QuerySuccessState<T>
	| QueryErrorState

export interface Query<T> {
	listeners: Set<() => void>;

	timeout?: number;
	promise?: Promise<void>;

	state: QueryState<T>;

	update (updater: (prev: QueryState<T>) => QueryState<T>): void;

	subscribe (listener: () => void): void;
	notify (): void;
}


export interface QueryOptions<D, K extends QueryKey = QueryKey> extends QueryContextOptions<D, K> {
	key: K;
	disabled?: boolean;
}

export function useQuery<D, K extends QueryKey = QueryKey> (options: QueryOptions<D, K>): QueryState<D>;

export function mutateQuery (cache: QueryCache, key: QueryKey, data?: any, invalidate?: boolean): void;

export function invalidateQueries (cache: QueryCache, keys: QueryKey, exclude?: boolean): void;
