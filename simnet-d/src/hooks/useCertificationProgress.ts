import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { LessonProgressItem, ModuleGroup } from '../lib/types';

export function useCertificationProgress(certId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['certProgress', certId, user?.id],
    queryFn: async (): Promise<ModuleGroup[]> => {
      const { data, error } = await supabase.rpc('get_certification_progress', {
        p_certification_id: certId,
      });
      if (error) throw error;
      const flat: LessonProgressItem[] = data ?? [];

      // Group flat array → Module tree (dưới 1ms, rất nhẹ)
      const map = new Map<string, ModuleGroup>();
      for (const lesson of flat) {
        if (!map.has(lesson.module_id)) {
          map.set(lesson.module_id, {
            id: lesson.module_id,
            name: lesson.module_name,
            slug: lesson.module_slug,
            order: lesson.module_order,
            lessons: [],
          });
        }
        map.get(lesson.module_id)!.lessons.push(lesson);
      }

      return Array.from(map.values()).sort((a, b) => a.order - b.order);
    },
    enabled: !!certId && !!user,
    staleTime: 5 * 60 * 1000,
  });
}
