/**
 * Utilitários genéricos para optimistic updates.
 * Não dependem de React — podem ser usados com qualquer state manager.
 */

export interface OptimisticState<T> {
  data: T;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: Error | null;
}

/**
 * Cria o estado inicial para uma operação otimista.
 */
export function createOptimisticState<T>(initialData: T): OptimisticState<T> {
  return { data: initialData, status: 'idle', error: null };
}

/**
 * Aplica uma mutação otimista localmente antes da confirmação do servidor.
 * Retorna um objeto com rollback caso a operação remota falhe.
 *
 * @example
 * const { apply, rollback } = optimisticMutation(currentList, (list) => [...list, newItem]);
 * apply();
 * try {
 *   await supabase.from('items').insert(newItem);
 * } catch {
 *   rollback();
 * }
 */
export function optimisticMutation<T>(
  current: T,
  mutator: (draft: T) => T
): { apply: () => T; rollback: () => T } {
  const previous = current;
  const next = mutator(current);
  return {
    apply: () => next,
    rollback: () => previous,
  };
}

/**
 * Wrapper genérico para executar uma mutação com optimistic update.
 */
export async function executeOptimistic<T>(
  mutateFn: () => Promise<T>,
  onOptimistic: () => void,
  onRollback: () => void
): Promise<T> {
  onOptimistic();
  try {
    const result = await mutateFn();
    return result;
  } catch (error) {
    onRollback();
    throw error;
  }
}
