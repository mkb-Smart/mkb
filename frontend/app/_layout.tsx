import { Stack } from "expo-router";
import "../global.css";
import { FavoritesProvider } from "@/context/FavoritesContext";

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FavoritesProvider>
  );
}
