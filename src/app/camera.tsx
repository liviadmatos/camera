import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DeviceSaveButton } from "../components/device-save-button";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [facing, setFacing] = useState<CameraType>("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToGallery, setSavedToGallery] = useState(false);
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
    setSavedToGallery(false);
  }

  function toggleCameraFacing() {
    if (isCapturing) return;
    setIsCameraReady(false);
    setFacing((current) => (current === "back" ? "front" : "back"));
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
    if (!photo || isSaving || savedToGallery) return;
    setIsSaving(true);

    try {
      const existingPhotos = await AsyncStorage.getItem("photos");
      const photos = existingPhotos ? JSON.parse(existingPhotos) : [];

      const alreadySaved = photos.some(
        (item: { uri: string }) => item.uri === photo,
      );

      if (alreadySaved) {
        setSavedToGallery(true);
        Alert.alert("Foto já salva", "Essa foto já está na galeria do app.");
        return;
      }

      photos.push({
        id: Date.now().toString(),
        uri: photo,
        caption,
        date: new Date().toLocaleDateString("pt-BR"),
      });

      await AsyncStorage.setItem("photos", JSON.stringify(photos));
      setSavedToGallery(true);
      Alert.alert("Foto salva!", "A foto foi adicionada à galeria do app.");
    } catch (error) {
      console.log("Erro ao salvar foto:", error);
      Alert.alert("Erro", "Não foi possível salvar a foto na galeria do app.");
    } finally {
      setIsSaving(false);
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
            <DeviceSaveButton uri={photo} />
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

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (isSaving || savedToGallery) && styles.disabledButton,
              ]}
              onPress={savePhoto}
              disabled={isSaving || savedToGallery}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {savedToGallery ? "Salva na galeria" : "Salvar na galeria"}
                </Text>
              )}
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
          facing={facing}
          onCameraReady={() => setIsCameraReady(true)}
        />

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            facing === "back" ? "Usar câmera frontal" : "Usar câmera traseira"
          }
          style={styles.flipButton}
          onPress={toggleCameraFacing}
          disabled={!isCameraReady || isCapturing}
        >
          <Text style={styles.flipButtonText}>↻</Text>
        </TouchableOpacity>

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
    backgroundColor: "#F1F4F0",
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F1F4F0",
  },

  header: {
    height: 88,
    paddingTop: 44,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F4F0",
    borderBottomWidth: 1,
    borderBottomColor: "#DCE4DE",
  },

  headerButton: {
    minWidth: 58,
  },

  backButton: {
    fontSize: 15,
    fontWeight: "600",
    color: "#183F36",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#183F36",
  },

  headerSpace: {
    width: 58,
  },

  cameraWrap: {
    flex: 1,
    position: "relative",
    backgroundColor: "#111A18",
  },

  camera: {
    flex: 1,
  },

  flipButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(17,26,24,0.76)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  flipButtonText: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 30,
    fontWeight: "600",
  },

  captureContainer: {
    position: "absolute",
    bottom: 26,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  captureButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#D66349",
    borderWidth: 3,
    borderColor: "#FCE9E2",
  },

  previewScreen: {
    flex: 1,
    backgroundColor: "#F1F4F0",
    padding: 16,
  },

  previewCard: {
    width: "100%",
    flex: 1,
    minHeight: 220,
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    overflow: "hidden",
  },

  photo: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },

  infoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#DCE4DE",
  },

  captionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#183F36",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#183F36",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE4DE",
    borderRadius: 6,
    padding: 24,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#183F36",
    marginBottom: 10,
  },

  permissionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5F716B",
    marginBottom: 22,
  },

  primaryButton: {
    backgroundColor: "#183F36",
    borderRadius: 6,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.62,
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE4DE",
    borderRadius: 6,
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
