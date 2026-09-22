import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
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
  originalUri?: string;
  caption: string;
  date: string;
  filter?: FilterType;
};

const filters: { id: FilterType; name: string; color: string }[] = [
  { id: "normal", name: "Normal", color: "#FFFFFF" },
  { id: "yellow", name: "Amarelo", color: "#FFD54F" },
  { id: "blue", name: "Azul", color: "#42A5F5" },
  { id: "blackwhite", name: "P&B", color: "#777777" },
  { id: "pink", name: "Rosa", color: "#EC407A" },
  { id: "green", name: "Verde", color: "#66BB6A" },
];

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

const VALID_FILTERS: FilterType[] = [
  "normal",
  "yellow",
  "blue",
  "blackwhite",
  "pink",
  "green",
];

function isFilterType(value: unknown): value is FilterType {
  return (
    typeof value === "string" && VALID_FILTERS.includes(value as FilterType)
  );
}

export default function EditScreen() {
  const { id, uri, draft } = useLocalSearchParams<{
    id?: string | string[];
    uri?: string | string[];
    draft?: string | string[];
  }>();
  const router = useRouter();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("normal");
  const [isSaving, setIsSaving] = useState(false);

  const photoId = Array.isArray(id) ? id[0] : id;
  const sourceUri = Array.isArray(uri) ? uri[0] : uri;
  const isDraft = (Array.isArray(draft) ? draft[0] : draft) === "true";
  const currentFilterStyle =
    selectedFilter !== "normal" ? FILTER_STYLE[selectedFilter] : null;

  function goBackSafely() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/gallery");
    }
  }

  useEffect(() => {
    async function loadPhoto() {
      if (!photoId) {
        if (isDraft && sourceUri) {
          setPhoto({
            id: "draft",
            uri: sourceUri,
            caption: "",
            date: new Date().toLocaleDateString("pt-BR"),
          });
        }

        return;
      }

      try {
        const savedPhotos = await AsyncStorage.getItem("photos");
        const photos: Photo[] = savedPhotos ? JSON.parse(savedPhotos) : [];
        const selectedPhoto = photos.find((item) => item.id === photoId);

        if (!selectedPhoto) return;

        setPhoto(selectedPhoto);

        if (isFilterType(selectedPhoto.filter)) {
          setSelectedFilter(selectedPhoto.filter);
        } else {
          setSelectedFilter("normal");
        }
      } catch (error) {
        console.log("Erro ao carregar foto para edição:", error);
      }
    }

    loadPhoto();
  }, [isDraft, photoId, sourceUri]);

  async function saveEdit() {
    if (!photo || isSaving) return;

    setIsSaving(true);

    try {
      const originalUri = photo.originalUri ?? photo.uri;
      const normalizedFilter =
        selectedFilter === "normal" ? undefined : selectedFilter;

      if (isDraft) {
        await AsyncStorage.setItem(
          "cameraDraft",
          JSON.stringify({ uri: originalUri, filter: normalizedFilter }),
        );
      } else {
        const savedPhotos = await AsyncStorage.getItem("photos");
        const photos: Photo[] = savedPhotos ? JSON.parse(savedPhotos) : [];
        const updatedPhotos = photos.map((item) =>
          item.id === photo.id
            ? {
                ...item,
                uri: originalUri,
                originalUri,
                filter: normalizedFilter,
              }
            : item,
        );

        await AsyncStorage.setItem("photos", JSON.stringify(updatedPhotos));
      }

      Alert.alert("Foto editada!", "As alterações foram salvas.", [
        { text: "OK", onPress: goBackSafely },
      ]);
    } catch (error) {
      console.log("Erro ao salvar edição:", error);
      Alert.alert("Erro", "Não foi possível salvar a edição.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!photo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
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

        <Text style={styles.headerTitle}>Editar foto</Text>
        <View style={styles.headerSpace} />
      </View>

      <View style={styles.previewContainer}>
        {photo.uri ? (
          <>
            <Image
              source={{ uri: photo.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
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
          </>
        ) : (
          <ActivityIndicator size="large" color="#1F2D32" />
        )}
      </View>

      <Text style={styles.filtersTitle}>Filtros</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersList}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonSelected,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
            disabled={isSaving}
          >
            <View
              style={[styles.filterCircle, { backgroundColor: filter.color }]}
            />
            <Text style={styles.filterText}>{filter.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.disabledButton]}
        onPress={saveEdit}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar alterações</Text>
        )}
      </TouchableOpacity>
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
    marginTop: 12,
    fontSize: 16,
    color: "#2B2B2B",
  },

  header: {
    height: 88,
    paddingTop: 44,
    paddingHorizontal: 18,
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
    width: 58,
  },

  previewContainer: {
    height: 430,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#EAE1D8",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  previewImage: {
    width: "100%",
    height: "100%",
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

  filtersTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 16,
    color: "#1E272B",
  },

  filtersList: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 10,
  },

  filterButton: {
    minWidth: 72,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE6DF",
  },

  filterButtonSelected: {
    borderColor: "#1E272B",
    backgroundColor: "#F5F5F3",
  },

  filterCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(26, 36, 40, 0.18)",
    marginBottom: 6,
  },

  filterText: {
    fontSize: 11,
    color: "#2D2D2D",
    fontWeight: "500",
  },

  saveButton: {
    marginHorizontal: 16,
    marginTop: 22,
    backgroundColor: "#1E272B",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
