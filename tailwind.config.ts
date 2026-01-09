import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'cb-white': '#FFFFFF',
                'cb-gray-light': '#F5F6F8',
                'cb-gray-medium': '#A0A4AB',
                'cb-primary': '#1E2A45',
                'cb-secondary': '#3E5D8F',
                'cb-tertiary': '#6A8CAF',
            },
            fontFamily: {
                spartan: ['League Spartan', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'cb': '14px',
            },
            boxShadow: {
                'cb-card': '0 4px 6px rgba(30, 42, 69, 0.1)',
            },
        },
    },
    plugins: [],
};
export default config;
