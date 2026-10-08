import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

// A layout is not re-rendered when navigating between its pages or changing
// search params, so the sidebar and header stay mounted. Only `children` changes.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
