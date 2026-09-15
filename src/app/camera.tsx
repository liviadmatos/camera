import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Canvas,
  ColorMatrix,
  Image as SkiaImage,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
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

type ImageProcessorProps = {
  imageUri: string;
  filter: FilterType;
  onProcessed: (uri: string) => void;
  onError: () => void;
};

const filters: { id: FilterType; name: string; color: string }[] = [
  { id: "normal", name: "Normal", color: "#FFFFFF" },
  { id: "yellow", name: "Amarelo", color: "#FFD54F" },
  { id: "blue", name: "Azul", color: "#42A5F5" },
  { id: "blackwhite", name: "P&B", color: "#777777" },
  { id: "pink", name: "Rosa", color: "#EC407A" },
  { id: "green", name: "Verde", color: "#66BB6A" },
];

const FILTER_MATRICES: Record<FilterType, number[]> = {
  normal: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  yellow: [
    1.1, 0.1, 0, 0, 0, 0.05, 1.05, 0, 0, 0, 0, 0, 0.55, 0, 0, 0, 0, 0, 1, 0,
  ],
  blue: [0.7, 0, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0.1, 1.3, 0, 0, 0, 0, 0, 1, 0],
  blackwhite: [
    0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114,
    0, 0, 0, 0, 0, 1, 0,
  ],
  pink: [1.15, 0, 0, 0, 0, 0, 0.75, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0],
  green: [
    0.75, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0.05, 0.75, 0, 0, 0, 0, 0, 1, 0,
  ],
};

function ImageProcessor({
  imageUri,
  filter,
  onProcessed,
  onError,
}: ImageProcessorProps) {
  const image = useImage(imageUri);
  const canvasRef = useCanvasRef();
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (!image || !canvasReady) return;

    let processed = false;

    async function processImage() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (processed) return;

        const snapshot = await canvasRef.current?.makeImageSnapshotAsync();

        if (!snapshot) throw new Error("Não foi possível gerar a imagem.");

        processed = true;
        onProcessed(`data:image/png;base64,${snapshot.encodeToBase64()}`);
      } catch (error) {
        console.log("Erro ao processar imagem:", error);
        onError();
      }
    }

    processImage();

    return () => {
      processed = true;
    };
  }, [canvasReady, canvasRef, filter, image, onError, onProcessed]);

  if (!image) return null;

  return (
    <View
      style={[
        styles.processorContainer,
        { width: image.width(), height: image.height() },
      ]}
      onLayout={() => setCanvasReady(true)}
    >
      <Canvas
        ref={canvasRef}
        style={{ width: image.width(), height: image.height() }}
      >
        <SkiaImage
          image={image}
          x={0}
          y={0}
          width={image.width()}
          height={image.height()}
          fit="fill"
        >
          <ColorMatrix matrix={FILTER_MATRICES[filter]} />
        </SkiaImage>
      </Canvas>
    </View>
  );
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("normal");
  const [photoToProcess, setPhotoToProcess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Tirar foto</Text>

          <View style={styles.headerSpace} />
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.text}>
            Precisamos da sua permissão para usar a câmera.
          </Text>

          <Button title="Permitir câmera" onPress={requestPermission} />
        </View>
      </>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current || !isCameraReady || isCapturing || isProcessing)
      return;

    setIsCapturing(true);

    try {
      const result = await cameraRef.current.takePictureAsync();

      if (result?.uri) {
        if (selectedFilter === "normal") {
          setPhoto(result.uri);
        } else {
          setIsProcessing(true);
          setPhotoToProcess(result.uri);
        }
      }
    } catch (error) {
      console.log("Erro ao capturar foto:", error);
    } finally {
      setIsCapturing(false);
    }
  }

  function handleProcessedPhoto(processedUri: string) {
    setPhoto(processedUri);
    setPhotoToProcess(null);
    setIsProcessing(false);
  }

  function handleProcessingError() {
    setPhotoToProcess(null);
    setIsProcessing(false);
    Alert.alert("Erro", "Não foi possível aplicar o filtro.");
  }

  async function savePhoto() {
    if (!photo) return;

    try {
      const newPhoto = {
        id: Date.now().toString(),
        uri: photo,
        caption: caption,
        date: new Date().toLocaleDateString("pt-BR"),
        filter: selectedFilter,
      };

      const existingPhotos = await AsyncStorage.getItem("photos");
      const photos = existingPhotos ? JSON.parse(existingPhotos) : [];

      // Verifica se a foto já foi salva
      const alreadySaved = photos.some(
        (item: { uri: string }) => item.uri === photo,
      );

      if (alreadySaved) {
        Alert.alert("Foto já salva", "Essa foto já está na sua galeria.");
        return;
      }

      photos.push(newPhoto);

      await AsyncStorage.setItem("photos", JSON.stringify(photos));

      console.log("Foto salva com sucesso!");

      Alert.alert("Foto salva!", "A foto foi adicionada à sua galeria.");
    } catch (error) {
      console.log("Erro ao salvar foto:", error);

      Alert.alert("Erro", "Não foi possível salvar a foto.");
    }
  }

  if (photo) {
    return (
      <>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setPhoto(null);
              setCaption("");
            }}
          >
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Tirar foto</Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />

          <View style={styles.infoContainer}>
            <Text style={styles.captionTitle}>Adicione uma legenda</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: Experimento de química"
              placeholderTextColor="#888"
              value={caption}
              onChangeText={setCaption}
            />

            <Text style={styles.date}>
              📅 {new Date().toLocaleDateString("pt-BR")}
            </Text>

            <Text style={styles.selectedFilterText}>
              Filtro:{" "}
              {filters.find((filter) => filter.id === selectedFilter)?.name}
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setPhoto(null);
                setCaption("");
              }}
            >
              <Text style={styles.buttonText}>🔄 Tirar novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
              <Text style={styles.saveButtonText}>💾 Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tirar foto</Text>

        <View style={styles.headerSpace} />
      </View>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setIsCameraReady(true)}
        />

        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filtros</Text>

          <View style={styles.filtersList}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonSelected,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                disabled={isCapturing || isProcessing}
              >
                <View
                  style={[
                    styles.filterCircle,
                    { backgroundColor: filter.color },
                  ]}
                />
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextSelected,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePhoto}
            disabled={!isCameraReady || isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>

        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Aplicando filtro...</Text>
          </View>
        )}

        {photoToProcess && (
          <ImageProcessor
            imageUri={photoToProcess}
            filter={selectedFilter}
            onProcessed={handleProcessedPhoto}
            onError={handleProcessingError}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  captureContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },

  captureButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#222",
  },

  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  photo: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
  },

  buttons: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },

  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  text: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },

  infoContainer: {
    backgroundColor: "#F5F1E8",
    padding: 20,
  },

  captionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },

  date: {
    fontSize: 14,
    marginBottom: 15,
  },

  selectedFilterText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
  },

  saveButton: {
    backgroundColor: "#222",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  filtersContainer: {
    position: "absolute",
    bottom: 135,
    width: "100%",
    paddingHorizontal: 10,
  },

  filtersTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  filtersList: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  filterButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  filterButtonSelected: {
    borderWidth: 2,
    borderColor: "#fff",
  },

  filterCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#fff",
    marginBottom: 3,
  },

  filterText: {
    color: "#fff",
    fontSize: 10,
  },

  filterTextSelected: {
    fontWeight: "bold",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  },

  processorContainer: {
    position: "absolute",
    left: -10000,
    top: -10000,
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
