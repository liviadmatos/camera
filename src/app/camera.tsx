import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  function goBackSafely() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  function retakePhoto() {
    setPhoto(null);
    setCaption("");
  }

  async function takePhoto() {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;

    setIsCapturing(true);

    try {
      const result = await cameraRef.current.takePictureAsync();

      if (result?.uri) {
        setPhoto(result.uri);
      } else {
        Alert.alert("Erro", "Não foi possível capturar a foto.");
      }
    } catch (error) {
      console.log("Erro ao capturar foto:", error);
      Alert.alert("Erro", "Não foi possível capturar a foto.");
    } finally {
      setIsCapturing(false);
    }
  }

  async function savePhoto() {
    if (!photo) return;

    try {
      const existingPhotos = await AsyncStorage.getItem("photos");
      const photos = existingPhotos ? JSON.parse(existingPhotos) : [];

      const alreadySaved = photos.some(
        (item: { uri: string }) => item.uri === photo,
      );

      if (alreadySaved) {
        Alert.alert("Foto já salva", "Essa foto já está na sua galeria.");
        return;
      }

      photos.push({
        id: Date.now().toString(),
        uri: photo,
        caption,
        date: new Date().toLocaleDateString("pt-BR"),
      });

      await AsyncStorage.setItem("photos", JSON.stringify(photos));

      Alert.alert("Foto salva!", "A foto foi adicionada à sua galeria.");
    } catch (error) {
      console.log("Erro ao salvar foto:", error);
      Alert.alert("Erro", "Não foi possível salvar a foto.");
    }
  }

  if (!permission) {
    return <View style={styles.loadingScreen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackSafely} style={styles.headerButton}>
            <Text style={styles.backButton}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Câmera</Text>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.permissionContainer}>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Permitir acesso à câmera</Text>
            <Text style={styles.permissionText}>
              Precisamos da sua permissão para capturar imagens e continuar.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={requestPermission}
            >
              <Text style={styles.primaryButtonText}>Permitir câmera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={retakePhoto} style={styles.headerButton}>
            <Text style={styles.backButton}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Salvar foto</Text>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.previewScreen}>
          <View style={styles.previewCard}>
            <Image source={{ uri: photo }} style={styles.photo} />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.captionTitle}>Legenda</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: passeio de manhã"
              placeholderTextColor="#7B7B7B"
              value={caption}
              onChangeText={setCaption}
            />

            <Text style={styles.date}>
              {new Date().toLocaleDateString("pt-BR")}
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={retakePhoto}
            >
              <Text style={styles.secondaryButtonText}>Tirar novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={savePhoto}>
              <Text style={styles.primaryButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackSafely} style={styles.headerButton}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Câmera</Text>
        <View style={styles.headerSpace} />
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setIsCameraReady(true)}
        />

        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePhoto}
            disabled={!isCameraReady || isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F0EA",
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F4F0EA",
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

  cameraWrap: {
    flex: 1,
    position: "relative",
    backgroundColor: "#0F1518",
  },

  camera: {
    flex: 1,
  },

  captureContainer: {
    position: "absolute",
    bottom: 26,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  captureButton: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1E272B",
    borderWidth: 4,
    borderColor: "#F4F0EA",
  },

  previewScreen: {
    flex: 1,
    backgroundColor: "#F4F0EA",
    padding: 16,
  },

  previewCard: {
    width: "100%",
    height: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E1D8",
  },

  photo: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },

  infoContainer: {
    backgroundColor: "#F9F7F4",
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E9E1D8",
  },

  captionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E272B",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#1E272B",
    borderWidth: 1,
    borderColor: "#E3D9D1",
    marginBottom: 12,
  },

  date: {
    fontSize: 14,
    color: "#5C656A",
    marginBottom: 16,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  permissionCard: {
    width: "100%",
    backgroundColor: "#F9F7F4",
    borderWidth: 1,
    borderColor: "#E9E1D8",
    borderRadius: 24,
    padding: 24,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E272B",
    marginBottom: 10,
  },

  permissionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5F696D",
    marginBottom: 22,
  },

  primaryButton: {
    backgroundColor: "#1E272B",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E1D8",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },

  secondaryButtonText: {
    color: "#1E272B",
    fontSize: 16,
    fontWeight: "600",
  },
});
