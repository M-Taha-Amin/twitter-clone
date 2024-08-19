import Post from './Post';
import PostSkeleton from '../skeletons/PostSkeleton';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingBar from 'react-top-loading-bar';

const Posts = ({ feedType, userId = null, username = null }) => {
  const loadingBarRef = useRef();
  const getPostEndpoint = () => {
    switch (feedType) {
      case 'forYou':
        return '/api/posts/all';
      case 'following':
        return '/api/posts/following';
      case 'posts':
        return `/api/posts/user/${username}`;
      case 'likes':
        return `/api/posts/likes/${userId}`;
      default:
        return '/api/posts/all';
    }
  };

  const postEndpoint = getPostEndpoint();

  const {
    data: POSTS,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['getPosts'],
    queryFn: async () => {
      try {
        loadingBarRef.current.continuousStart(0);
        const res = await fetch(postEndpoint);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong');
        }
        loadingBarRef.current.complete();
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  return (
    <>
      <LoadingBar color="rgb(29, 155, 240)" ref={loadingBarRef} />
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && POSTS?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && POSTS && (
        <div>
          {POSTS.map(post => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
