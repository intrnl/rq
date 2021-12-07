import { QueryContextOptions, QueryKey } from './context';


type UseMutateFunction = (key: QueryKey, invalidate?: boolean) => void;
type UseInvalidateFunction = (keys: QueryKey, exclude?: boolean) => void;

export function useMutate (options?: QueryContextOptions): UseMutateFunction;
export function useInvalidate (options?: QueryContextOptions): UseInvalidateFunction;
