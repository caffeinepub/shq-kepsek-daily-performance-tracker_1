import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useAuthRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery({
    queryKey: ['authRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const isAdmin = await actor.isCallerAdmin();
      return isAdmin ? 'admin' : 'user';
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
    staleTime: Infinity,
  });

  return {
    role: query.data,
    isLoading: actorFetching || query.isLoading,
    isAdmin: query.data === 'admin',
    isKepsek: query.data === 'user',
  };
}
