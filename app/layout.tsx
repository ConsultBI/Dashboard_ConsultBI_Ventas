import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
    title: "Dashboard Analítico ConsultBI",
    description: "Gestión y análisis de ventas para ecommerce ConsultBI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="flex min-h-screen bg-cb-gray-light">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="p-4 md:p-8 flex-1">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
