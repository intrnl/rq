declare type Promisable<T> = T | Promise<T>;

export interface MutationIdleState {
	status: 'idle';
	data: null;
	error: null;
	mutating: false;
}

export interface MutationLoadingState {
	status: 'loading';
	data: null;
	error: null;
	mutating: true;
}

export interface MutationSuccessState<T> {
	status: 'success';
	data: T;
	error: null;
	mutating: boolean;
}

export interface MutationErrorState {
	status: 'error';
	data: null;
	error: unknown;
	mutating: boolean;
}

export declare type MutationState<T> =
	| MutationIdleState
	| MutationLoadingState
	| MutationSuccessState<T>
	| MutationErrorState;

export interface MutationMethods<V> {
	mutate (variables: V): Promise<void>;
	reset (): void;
}

export declare type MutationResult<D, V> = MutationState<D> & MutationMethods<V>;

export declare type Mutation<D, V> = (variables: V) => Promisable<D>;

export interface MutationOptions<D = unknown, V = unknown, C = unknown> {
	onMutate (variables: V): Promisable<C>;
	onSuccess (data: D, variables: V, context: C): Promisable<void>;
	onError (error: unknown, variables: V, context: C): Promisable<void>;
	onSettled (data: D, error: unknown, variables: V, context: C): Promisable<void>;
}

export declare function useMutation<D, V, C> (
	mutation: Mutation<D, V>,
	options?: MutationOptions<D, V, C>
): MutationResult<D, V>;
