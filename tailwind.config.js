/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#10A37F",
                secondary: "#5436DA",
                background: {
                    primary: "#0F0F0F",
                    secondary: "#171717",
                    tertiary: "#1F1F1F",
                },
                border: "#2D2D2D",
            },
            boxShadow: {
                input: "0 0 0 2px rgba(16, 163, 127, 0.3)",
            },
            typography: {
                DEFAULT: {
                    css: {
                        color: '#FFFFFF',
                        a: {
                            color: '#10A37F',
                            '&:hover': {
                                color: '#0E8E6D',
                            },
                        },
                    },
                },
            },
        },
    },
    plugins: [
        require("daisyui"),
    ],
} 