import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
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

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const router = useRouter();

  function goBackSafely() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  async function loadPhotos() {
    try {
      const savedPhotos = await AsyncStorage.getItem("photos");

      if (savedPhotos) {
        setPhotos([...JSON.parse(savedPhotos)].reverse());
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.log("Erro ao carregar fotos:", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, []),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackSafely} style={styles.headerButton}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Minha galeria</Text>

        <View style={styles.headerSpace} />
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Minha galeria</Text>

        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhuma foto ainda</Text>
            <Text style={styles.emptyText}>
              Tire uma foto para ela aparecer aqui.
            </Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gallery}
            renderItem={({ item }) => {
              const filterStyle =
                item.filter && item.filter !== "normal"
                  ? FILTER_STYLE[item.filter]
                  : null;

              return (
                <View style={styles.card}>
                  <TouchableOpacity
                    onPress={() => router.push(`/photo?id=${item.id}`)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: item.uri }} style={styles.image} />
                      {filterStyle && (
                        <View
                          style={[
                            styles.filterOverlay,
                            {
                              backgroundColor: filterStyle.color,
                              opacity: filterStyle.opacity,
                            },
                          ]}
                        />
                      )}
                    </View>

                    <Text style={styles.caption} numberOfLines={2}>
                      {item.caption || "Sem legenda"}
                    </Text>

                    <Text style={styles.date}>{item.date}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/edit?id=${item.id}`)}
                  >
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F0EA",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F0EA",
    paddingTop: 10,
    paddingBottom: 32,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginHorizontal: 20,
    marginBottom: 18,
    color: "#1E272B",
  },

  gallery: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },

  card: {
    width: "46%",
    margin: "2%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAE1D8",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  imageContainer: {
    position: "relative",
    width: "100%",
    height: 170,
    backgroundColor: "#F9F7F4",
  },

  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#F9F7F4",
  },

  filterOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  caption: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingTop: 10,
    color: "#1E272B",
  },

  date: {
    fontSize: 12,
    color: "#707070",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  editButton: {
    backgroundColor: "#F4F1ED",
    borderTopWidth: 1,
    borderTopColor: "#ECE4DC",
    paddingVertical: 10,
    alignItems: "center",
  },

  editText: {
    color: "#1E272B",
    fontSize: 13,
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1E272B",
  },

  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
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
});
