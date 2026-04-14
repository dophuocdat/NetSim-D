import { DashboardHero } from '../components/dashboard/DashboardHero';
import { CourseExplorer } from '../components/dashboard/CourseExplorer';

export function Dashboard() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <DashboardHero />
      <CourseExplorer />
    </div>
  );
}
