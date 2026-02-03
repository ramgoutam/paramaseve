import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Header from "./Header";
import TopRibbon from "./TopRibbon";

export const ProtectedLayout = () => {
    return (
        <ProtectedRoute>
            <div className="h-screen bg-gray-50/50 flex flex-col overflow-hidden">
                <div className="flex-none">
                    <TopRibbon />
                    <Header />
                </div>
                <main className="flex-1 overflow-auto relative">
                    <Outlet />
                </main>
            </div>
        </ProtectedRoute>
    );
};
