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

type Photo = {
  id: string;
  uri: string;
  caption: string;
  date: string;
};

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const router = useRouter();

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
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Minha galeria</Text>

        <View style={styles.headerSpace} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Minha galeria</Text>

        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🖼️</Text>

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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/photo?id=${item.id}`)}
              >
                <Image source={{ uri: item.uri }} style={styles.image} />

                <Text style={styles.caption} numberOfLines={2}>
                  {item.caption || "Sem legenda"}
                </Text>

                <Text style={styles.date}>📅 {item.date}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1E8",
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 20,
  },

  gallery: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },

  card: {
    width: "46%",
    margin: "2%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 160,
  },

  caption: {
    fontSize: 15,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  date: {
    fontSize: 12,
    color: "#666",
    padding: 10,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  header: {
    height: 90,
    paddingTop: 45,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    fontSize: 16,
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  headerSpace: {
    width: 60,
  },
});
