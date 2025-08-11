import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
}

export const ThemeProvider = ({ children, defaultTheme = "dark" }: ThemeProviderProps) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		// Check localStorage first
		const savedTheme = localStorage.getItem("theme") as Theme | null;
		if (savedTheme) return savedTheme;

		// Check system preference
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			return "dark";
		}

		return defaultTheme;
	});

	useEffect(() => {
		const root = document.documentElement;

		// Remove both classes first
		root.classList.remove("light", "dark");

		// Add the current theme class
		root.classList.add(theme);

		// Save to localStorage
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setThemeState((prev) => (prev === "light" ? "dark" : "light"));
	};

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
};
