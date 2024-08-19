import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async updatedData => {
      try {
        const res = await fetch('/api/users/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong!');
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: async () => {
      toast.success('Profile updated successfully');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['getAuthUser'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['getUserProfile'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['getPosts'],
        }),
      ]);
    },
  });
  return { updateProfile, isUpdatingProfile };
};
export default useUpdateUserProfile;
