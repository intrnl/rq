import { QueryContextOptions, QueryKey } from './context';


declare type UseMutateFunction = (key: QueryKey, data?: any, invalidate?: boolean) => void;
declare type UseInvalidateFunction = (keys: QueryKey) => void;

export declare const useMutate: (options?: QueryContextOptions) => UseMutateFunction;
export declare const useInvalidate: (options?: QueryContextOptions) => UseInvalidateFunction;
