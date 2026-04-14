import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  base_topology: any; 
}

export function useLessonData(slug: string) {
  return useQuery({
    queryKey: ['lesson', slug],
    queryFn: async (): Promise<LessonData> => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
