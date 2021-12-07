import { useReducer } from 'preact/hooks';


function init () {
	return {
		status: 'idle',
		data: null,
		error: null,
		mutating: false,
	};
}

export function useMutation (mutation, options) {
	const { onMutate, onSuccess, onError, onSettled } = options;
	const [state, update] = useReducer(updateReducer, null, init);

	const mutate = async (variables) => {
		return update.promise ||= (async () => {
			update((prev) => ({
				...prev,
				status: prev.status === 'idle' ? 'loading' : prev.status,
				mutating: true,
			}));

			let context;

			try {
				context = await onMutate?.(variables);
				const data = await mutation(variables);

				update((prev) => ({ ...prev, status: 'success', data, error: null }));
				onSuccess?.(data, variables, context);
			}
			catch (error) {
				update((prev) => ({ ...prev, status: 'error', data: null, error }));
				onError?.(error, variables, context);
			}
			finally {
				update.promise = null;

				update((prev) => ({ ...prev, mutating: false }));
				onSettled?.(variables, context);
			}
		});
	};

	const reset = () => {
		if (update.promise) {
			return;
		}

		update(init);
	};

	return { ...state, mutate, reset };
}

function updateReducer (current, updater) {
	return updater(current);
}
