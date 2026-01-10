import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import CalendarToggle from '../../components/CalendarToggle';

export default function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-neon-blue/30 selection:text-neon-blue">
            <Navbar />
            <div className="flex pt-16 h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Ambient Background Glow for Dashboard */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.05),transparent_50%)] pointer-events-none" />

                    <CalendarToggle />
                    <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar relative z-10">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
