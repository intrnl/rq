import { QueryContextOptions, QueryKey } from './context';


type UseMutateFunction = (key: QueryKey, invalidate?: boolean) => void;
type UseInvalidateFunction = (keys: QueryKey) => void;

export function useMutate (options?: QueryContextOptions): UseMutateFunction;
export function useInvalidate (options?: QueryContextOptions): UseInvalidateFunction;
