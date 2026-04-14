import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Track, Certification, DashboardStats } from '../lib/types';

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: async (): Promise<Track[]> => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id, name, slug, icon_url, color')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: ['certifications'],
    queryFn: async (): Promise<Certification[]> => {
      const { data, error } = await supabase
        .from('certifications')
        .select('id, track_id, name, slug, difficulty_level, icon_url')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const [progressRes, streakRes] = await Promise.all([
        supabase.from('user_progress')
          .select('xp_earned, status')
          .eq('user_id', user!.id),
        supabase.from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', user!.id)
          .maybeSingle(),
      ]);
      if (progressRes.error) throw progressRes.error;
      const progress = progressRes.data ?? [];
      const streak = streakRes.data;

      return {
        total_xp: progress.reduce((sum, p) => sum + (p.xp_earned || 0), 0),
        completed_count: progress.filter(p => p.status === 'completed').length,
        current_streak: streak?.current_streak ?? 0,
        longest_streak: streak?.longest_streak ?? 0,
      };
    },
    enabled: !!user,
  });
}
