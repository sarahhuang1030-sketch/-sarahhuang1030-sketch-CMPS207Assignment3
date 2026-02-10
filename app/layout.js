import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Heading from "./components/Heading";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "CMPS 207 - Assignment 3",
    description: "Assignment 3 Next App",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Heading />
        <main className="max-w-6xl mx-auto p-4">{children}</main>
        </body>
        </html>
    );
}
