import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { CurrentLessonData } from '../lib/types';

export function useCurrentLesson() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['currentLesson', user?.id],
    queryFn: async (): Promise<CurrentLessonData | null> => {
      const { data, error } = await supabase.rpc('get_current_lesson');
      if (error) throw error;
      return data as CurrentLessonData | null;
    },
    enabled: !!user,
  });
}
