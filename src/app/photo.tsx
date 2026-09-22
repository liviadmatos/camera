import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterType =
  | "normal"
  | "yellow"
  | "blue"
  | "blackwhite"
  | "pink"
  | "green";

type Photo = {
  id: string;
  uri: string;
  caption: string;
  date: string;
  filter?: FilterType;
};

const FILTER_STYLE: Record<
  Exclude<FilterType, "normal">,
  { color: string; opacity: number }
> = {
  yellow: { color: "#FFD54F", opacity: 0.28 },
  blue: { color: "#42A5F5", opacity: 0.26 },
  blackwhite: { color: "#F5F5F5", opacity: 0.34 },
  pink: { color: "#EC407A", opacity: 0.25 },
  green: { color: "#66BB6A", opacity: 0.24 },
};

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const [photo, setPhoto] = useState<Photo | null>(null);

  const photoId = Array.isArray(id) ? id[0] : id;

  function goBackSafely() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/gallery");
    }
  }

  const loadPhoto = useCallback(async () => {
    if (!photoId) return;

    try {
      const savedPhotos = await AsyncStorage.getItem("photos");
      const photos: Photo[] = savedPhotos ? JSON.parse(savedPhotos) : [];
      const selectedPhoto = photos.find((item) => item.id === photoId);

      setPhoto(selectedPhoto ?? null);
    } catch (error) {
      console.log("Erro ao carregar foto:", error);
    }
  }, [photoId]);

  const currentFilterStyle =
    photo && photo.filter && photo.filter !== "normal"
      ? FILTER_STYLE[photo.filter]
      : null;

  useFocusEffect(
    useCallback(() => {
      loadPhoto();
    }, [loadPhoto]),
  );

  async function deletePhoto() {
    if (!photoId) return;

    Alert.alert("Excluir foto", "Tem certeza que deseja excluir esta foto?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const savedPhotos = await AsyncStorage.getItem("photos");
            const photos: Photo[] = savedPhotos ? JSON.parse(savedPhotos) : [];
            const updatedPhotos = photos.filter((item) => item.id !== photoId);

            await AsyncStorage.setItem("photos", JSON.stringify(updatedPhotos));
            goBackSafely();
          } catch (error) {
            console.log("Erro ao excluir foto:", error);
          }
        },
      },
    ]);
  }

  if (!photo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando foto...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackSafely} style={styles.headerButton}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Foto</Text>
        <View style={styles.headerSpace} />
      </View>

      <View style={styles.photoContainer}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
        {currentFilterStyle && (
          <View
            style={[
              styles.filterOverlay,
              {
                backgroundColor: currentFilterStyle.color,
                opacity: currentFilterStyle.opacity,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.caption}>{photo.caption || "Sem legenda"}</Text>

        <Text style={styles.date}>{photo.date}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/edit?id=${photo.id}`)}
        >
          <Text style={styles.editText}>Editar foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={deletePhoto}>
          <Text style={styles.deleteText}>Excluir foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0EA",
    paddingBottom: 32,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F0EA",
  },

  loadingText: {
    fontSize: 16,
    color: "#1E272B",
  },

  header: {
    height: 88,
    paddingTop: 44,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F7F4",
    borderBottomWidth: 1,
    borderBottomColor: "#E9E2DB",
  },

  headerButton: {
    minWidth: 58,
  },

  backButton: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E272B",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E272B",
  },

  headerSpace: {
    width: 60,
  },

  photoContainer: {
    position: "relative",
    width: "100%",
    height: 430,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAE1D8",
  },

  photo: {
    width: "100%",
    height: 430,
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },

  filterOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  caption: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E272B",
    marginBottom: 8,
  },

  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },

  editButton: {
    backgroundColor: "#1E272B",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  editText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#F4E5E2",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  deleteText: {
    color: "#8A3B2E",
    fontSize: 16,
    fontWeight: "700",
  },
});
