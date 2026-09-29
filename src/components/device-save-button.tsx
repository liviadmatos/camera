import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {
    isPhotoSavedToDevice,
    savePhotoToDevice,
} from "../utils/device-photos";

type DeviceSaveButtonProps = { uri: string };

export function DeviceSaveButton({ uri }: DeviceSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let active = true;

    isPhotoSavedToDevice(uri)
      .then((saved) => {
        if (active) setIsSaved(saved);
      })
      .catch((error) => console.log("Erro ao verificar foto salva:", error));

    return () => {
      active = false;
    };
  }, [uri]);

  async function savePhoto() {
    if (isSaving || isSaved) return;
    setIsSaving(true);

    try {
      const saved = await savePhotoToDevice(uri);
      if (saved === "permission-denied") {
        Alert.alert(
          "Permissão necessária",
          "Autorize o acesso para salvar fotos na biblioteca do dispositivo.",
        );
        return;
      }
      setIsSaved(true);
    } catch (error) {
      console.log("Erro ao salvar foto no dispositivo:", error);
      const reason = error instanceof Error ? error.message : String(error);
      Alert.alert(
        "Erro ao salvar",
        `Não foi possível salvar a foto no dispositivo.\n\n${reason}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={
        isSaved ? "Foto salva no dispositivo" : "Salvar foto no dispositivo"
      }
      accessibilityState={{ disabled: isSaving || isSaved, selected: isSaved }}
      style={[styles.button, isSaved && styles.savedButton]}
      onPress={savePhoto}
      disabled={isSaving || isSaved}
      activeOpacity={0.82}
    >
      {isSaving ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <SymbolView
          name={{
            ios: isSaved ? "checkmark" : "square.and.arrow.down",
            android: isSaved ? "check" : "download",
            web: isSaved ? "check" : "download",
          }}
          size={22}
          tintColor="#FFFFFF"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(24,63,54,0.9)",
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderRadius: 23,
    zIndex: 2,
  },
  savedButton: {
    backgroundColor: "#318457",
  },
});
