import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type AppThemeMode =
  | "light"
  | "dark"
  | "system";

type ThemeContextType = {
  themeMode: AppThemeMode;
  isDarkMode: boolean;
  setThemeMode: (
    mode: AppThemeMode
  ) => Promise<void>;
};

const THEME_STORAGE_KEY =
  "@school_driver_theme";

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({
  children,
}: AppThemeProviderProps) {
  const systemColorScheme =
    useColorScheme();

  const [themeMode, setThemeModeState] =
    useState<AppThemeMode>("system");

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY
          );

        if (
          savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system"
        ) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.log(
          "THEME LOAD ERROR:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadTheme();
  }, []);

  const setThemeMode = async (
    mode: AppThemeMode
  ) => {
    setThemeModeState(mode);

    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        mode
      );
    } catch (error) {
      console.log(
        "THEME SAVE ERROR:",
        error
      );
    }
  };

  const isDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" &&
      systemColorScheme === "dark");

  const value = useMemo(
    () => ({
      themeMode,
      isDarkMode,
      setThemeMode,
    }),
    [
      themeMode,
      isDarkMode,
    ]
  );

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside AppThemeProvider"
    );
  }

  return context;
}