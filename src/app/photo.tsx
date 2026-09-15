import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Photo = {
  id: string;
  uri: string;
  caption: string;
  date: string;
};

export default function PhotoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [photo, setPhoto] = useState<Photo | null>(null);

  async function loadPhoto() {
    try {
      const savedPhotos = await AsyncStorage.getItem('photos');

      if (savedPhotos) {
        const photos: Photo[] = JSON.parse(savedPhotos);

        const selectedPhoto = photos.find(
          (item) => item.id === id
        );

        if (selectedPhoto) {
          setPhoto(selectedPhoto);
        }
      }
    } catch (error) {
      console.log('Erro ao carregar foto:', error);
    }
  }

  useEffect(() => {
    loadPhoto();
  }, [id]);

  async function deletePhoto() {
    Alert.alert(
      'Excluir foto',
      'Tem certeza que deseja excluir esta foto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const savedPhotos =
                await AsyncStorage.getItem('photos');

              if (savedPhotos) {
                const photos: Photo[] =
                  JSON.parse(savedPhotos);

                const updatedPhotos = photos.filter(
                  (item) => item.id !== id
                );

                await AsyncStorage.setItem(
                  'photos',
                  JSON.stringify(updatedPhotos)
                );
              }

              router.back();
            } catch (error) {
              console.log('Erro ao excluir foto:', error);
            }
          },
        },
      ]
    );
  }

  if (!photo) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando foto...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Foto</Text>

        <View style={styles.headerSpace} />
      </View>

      <Image
        source={{ uri: photo.uri }}
        style={styles.photo}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.caption}>
          {photo.caption || 'Sem legenda'}
        </Text>

        <Text style={styles.date}>
          📅 {photo.date}
        </Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={deletePhoto}
        >
          <Text style={styles.deleteText}>
            🗑️ Excluir foto
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F1E8',
  },

  header: {
    height: 90,
    paddingTop: 45,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  headerSpace: {
    width: 60,
  },

  photo: {
    width: '100%',
    height: 430,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },

  infoContainer: {
    padding: 20,
  },

  caption: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },

  deleteButton: {
    backgroundColor: '#222',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});