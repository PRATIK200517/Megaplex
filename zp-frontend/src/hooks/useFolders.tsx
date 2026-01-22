import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useFolders = (page: number, limit: number = 12) => {
  return useQuery({
    queryKey: ['folders', page, limit],
    queryFn: async () => {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/getFolders`, {
        params: {
          paginate: 'true',
          page,
          limit,
          sort: 'newest'
        }
      });
      return data;
    },
    // Keep previous data while fetching new page to prevent UI jumping
    placeholderData: (previousData) => previousData,
  });
};