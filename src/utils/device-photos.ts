import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const SAVED_PHOTO_URIS_KEY = "deviceSavedPhotoUris";
export type SavePhotoResult = "saved" | "permission-denied";

async function getSavedPhotoUris(): Promise<string[]> {
  const storedUris = await AsyncStorage.getItem(SAVED_PHOTO_URIS_KEY);
  if (!storedUris) return [];

  const parsed: unknown = JSON.parse(storedUris);
  return Array.isArray(parsed)
    ? parsed.filter((uri): uri is string => typeof uri === "string")
    : [];
}

export async function isPhotoSavedToDevice(uri: string): Promise<boolean> {
  return (await getSavedPhotoUris()).includes(uri);
}

export async function savePhotoToDevice(uri: string): Promise<SavePhotoResult> {
  if (await isPhotoSavedToDevice(uri)) return "saved";

  if (Platform.OS === "web") {
    const downloadLink = document.createElement("a");
    downloadLink.href = uri;
    downloadLink.download = `frame-${Date.now()}.jpg`;
    downloadLink.click();
  } else {
    const { Asset, requestPermissionsAsync } =
      await import("expo-media-library");
    const permission = await requestPermissionsAsync(true, ["photo"]);
    if (!permission.granted) return "permission-denied";

    await Asset.create(uri);
  }

  const savedUris = await getSavedPhotoUris();
  await AsyncStorage.setItem(
    SAVED_PHOTO_URIS_KEY,
    JSON.stringify([...new Set([...savedUris, uri])]),
  );
  return "saved";
}
