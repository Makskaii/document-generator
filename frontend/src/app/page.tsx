import { DashboardHome } from './DashboardHome';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';

export default function Home() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="workspace">
        <Header />
        <DashboardHome />
      </section>
    </main>
  );
}
