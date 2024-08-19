import { useMutation, useQueryClient } from '@tanstack/react-query';

const useFollow = () => {
  const queryClient = useQueryClient();
  const { mutate: followUnfollowUser, isPending } = useMutation({
    mutationFn: async userId => {
      try {
        const response = await fetch(`/api/users/follow/${userId}`, {
          method: 'POST',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong');
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      Promise.all[
        (queryClient.invalidateQueries({ queryKey: ['getSuggestedUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['getAuthUser'] }))
      ];
    },
  });
  return { followUnfollowUser, isPending };
};

export default useFollow;
