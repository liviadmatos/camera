import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Photo = { uri: string; caption: string };
type Question = { photo: Photo; choices: string[] };

const EXTRA_CAPTIONS = [
  "Um dia para guardar",
  "A melhor companhia",
  "Pequenos momentos, grandes memórias",
  "Risada sem motivo",
  "Nosso lugar favorito",
  "A vida acontecendo",
  "Sol, amigos e boas histórias",
  "Um clique perfeito",
];

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function makeQuestions(photos: Photo[], count: number): Question[] {
  const captions = photos.map((photo) => photo.caption.trim());

  return shuffle(photos)
    .slice(0, count)
    .map((photo) => {
      const correctCaption = photo.caption.trim();
      const correctKey = correctCaption.toLocaleLowerCase("pt-BR");
      const seen = new Set([correctKey]);
      const alternatives: string[] = [];

      for (const caption of shuffle([...captions, ...EXTRA_CAPTIONS])) {
        const trimmed = caption.trim();
        const key = trimmed.toLocaleLowerCase("pt-BR");
        if (!trimmed || seen.has(key)) continue;
        seen.add(key);
        alternatives.push(trimmed);
        if (alternatives.length === 3) break;
      }

      return {
        photo,
        choices: shuffle([correctCaption, ...alternatives]),
      };
    });
}

export default function GameScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [photoCountInput, setPhotoCountInput] = useState("4");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      try {
        const storedPhotos = await AsyncStorage.getItem("photos");
        const parsed: unknown = storedPhotos ? JSON.parse(storedPhotos) : [];
        const photos = Array.isArray(parsed)
          ? parsed.filter(
              (photo): photo is Photo =>
                typeof photo?.uri === "string" &&
                typeof photo?.caption === "string" &&
                photo.caption.trim().length > 0,
            )
          : [];

        if (active) {
          setPhotoCount(photos.length);
          setPhotos(photos);
          setPhotoCountInput(String(Math.min(4, photos.length)));
        }
      } catch (error) {
        console.log("Erro ao carregar fotos do desafio:", error);
        if (active) setQuestions([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadQuestions();
    return () => {
      active = false;
    };
  }, []);

  const question = questions[questionIndex];
  const hasAnswered = selectedChoice !== null;
  const isCorrect =
    hasAnswered && selectedChoice === question?.photo.caption.trim();

  function normalizePhotoCount(value: string) {
    const parsedCount = Number.parseInt(value, 10);
    if (!Number.isFinite(parsedCount)) return 4;
    return Math.min(photoCount, Math.max(4, parsedCount));
  }

  function startGame() {
    const count = normalizePhotoCount(photoCountInput);
    setPhotoCountInput(String(count));
    setQuestions(makeQuestions(photos, count));
    setQuestionIndex(0);
    setSelectedChoice(null);
    setScore(0);
    setHasStarted(true);
  }

  function adjustPhotoCount(amount: number) {
    const currentCount = normalizePhotoCount(photoCountInput);
    const nextCount = Math.min(photoCount, Math.max(4, currentCount + amount));
    setPhotoCountInput(String(nextCount));
  }

  function answer(choice: string) {
    if (hasAnswered || !question) return;
    setSelectedChoice(choice);
    if (choice === question.photo.caption.trim()) {
      setScore((current) => current + 1);
    }
  }

  function goToNextQuestion() {
    if (questionIndex + 1 >= questions.length) {
      setIsFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedChoice(null);
  }

  function exitGame() {
    router.replace("/");
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Sair do jogo e voltar ao início"
          onPress={exitGame}
          style={styles.exitButton}
        >
          <Text style={styles.exitText}>Sair</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DESAFIO ENTRE AMIGOS</Text>
        <View style={styles.headerSpace} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#183F36" />
        </View>
      ) : isFinished ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEyebrow}>RODADA ENCERRADA</Text>
          <Text style={styles.emptyTitle}>Fim de jogo</Text>
          <Text style={styles.emptyText}>
            Você acertou {score} de {questions.length} fotos.
          </Text>
        </View>
      ) : hasStarted && question ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.roundInfo}>
            <Text style={styles.roundLabel}>
              FOTO {questionIndex + 1} / {questions.length}
            </Text>
            <Text style={styles.scoreLabel}>PONTOS {score}</Text>
          </View>

          <Text style={styles.title}>Qual legenda combina?</Text>

          <View style={styles.photoFrame}>
            <Image
              source={{ uri: question.photo.uri }}
              style={styles.photo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.sectionLabel}>ESCOLHA UMA LEGENDA</Text>

          <View style={styles.choices}>
            {question.choices.map((choice, index) => {
              const isAnswer = choice === question.photo.caption.trim();
              const isSelected = choice === selectedChoice;
              const choiceState = hasAnswered
                ? isAnswer
                  ? styles.correctChoice
                  : isSelected
                    ? styles.wrongChoice
                    : styles.inactiveChoice
                : styles.choiceButton;

              return (
                <TouchableOpacity
                  key={`${index}-${choice}`}
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: hasAnswered,
                    selected: isSelected,
                  }}
                  style={[styles.choiceButton, choiceState]}
                  onPress={() => answer(choice)}
                  disabled={hasAnswered}
                  activeOpacity={0.82}
                >
                  <Text
                    style={[
                      styles.choiceNumber,
                      isAnswer && hasAnswered && styles.correctText,
                      isSelected && !isAnswer && styles.wrongText,
                    ]}
                  >
                    0{index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.choiceText,
                      isAnswer && hasAnswered && styles.correctText,
                      isSelected && !isAnswer && styles.wrongText,
                    ]}
                  >
                    {choice}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {hasAnswered && (
            <>
              <Text
                accessibilityLiveRegion="polite"
                style={[
                  styles.feedback,
                  isCorrect ? styles.correctText : styles.wrongText,
                ]}
              >
                {isCorrect ? "Acertou!" : "Não foi dessa vez"}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.nextButton}
                onPress={goToNextQuestion}
                activeOpacity={0.86}
              >
                <Text style={styles.nextButtonText}>
                  {questionIndex + 1 >= questions.length
                    ? "Finalizar"
                    : "Próxima foto"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : photoCount < 4 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEyebrow}>DESAFIO ENTRE AMIGOS</Text>
          <Text style={styles.emptyTitle}>Faltam fotos para começar</Text>
          <Text style={styles.emptyText}>
            Adicione pelo menos 4 fotos com legenda à galeria para iniciar o
            jogo.
          </Text>
          <Text style={styles.photoCount}>
            FOTOS COM LEGENDA: {photoCount} / 4
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.nextButton}
            onPress={() => router.push("/camera")}
          >
            <Text style={styles.nextButtonText}>Adicionar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.setupContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.emptyEyebrow}>DESAFIO ENTRE AMIGOS</Text>
          <Text style={styles.emptyTitle}>
            Quantas fotos vão para a rodada?
          </Text>
          <Text style={styles.emptyText}>
            Só fotos com legenda participam. Escolha entre 4 e {photoCount};
            elas serão sorteadas e embaralhadas.
          </Text>

          <View style={styles.countControl}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Diminuir quantidade de fotos"
              accessibilityState={{
                disabled: normalizePhotoCount(photoCountInput) <= 4,
              }}
              style={[
                styles.countButton,
                normalizePhotoCount(photoCountInput) <= 4 &&
                  styles.countButtonDisabled,
              ]}
              onPress={() => adjustPhotoCount(-1)}
              disabled={normalizePhotoCount(photoCountInput) <= 4}
            >
              <Text style={styles.countButtonText}>−</Text>
            </TouchableOpacity>

            <TextInput
              accessibilityLabel="Quantidade de fotos para jogar"
              style={styles.countInput}
              keyboardType="number-pad"
              value={photoCountInput}
              onChangeText={(value) =>
                setPhotoCountInput(value.replace(/\D/g, ""))
              }
              onEndEditing={() =>
                setPhotoCountInput(String(normalizePhotoCount(photoCountInput)))
              }
              selectTextOnFocus
              maxLength={String(photoCount).length}
            />

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Aumentar quantidade de fotos"
              accessibilityState={{
                disabled: normalizePhotoCount(photoCountInput) >= photoCount,
              }}
              style={[
                styles.countButton,
                normalizePhotoCount(photoCountInput) >= photoCount &&
                  styles.countButtonDisabled,
              ]}
              onPress={() => adjustPhotoCount(1)}
              disabled={normalizePhotoCount(photoCountInput) >= photoCount}
            >
              <Text style={styles.countButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.countHint}>
            FOTOS COM LEGENDA DISPONÍVEIS: {photoCount}
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            style={styles.nextButton}
            onPress={startGame}
          >
            <Text style={styles.nextButtonText}>Iniciar jogo</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F1F4F0",
  },
  header: {
    minHeight: 82,
    paddingTop: 38,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#DCE4DE",
  },
  exitButton: {
    minWidth: 48,
    minHeight: 40,
    justifyContent: "center",
  },
  exitText: {
    color: "#D66349",
    fontSize: 15,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#5F716B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerSpace: {
    width: 48,
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  setupContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 36,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  roundInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  roundLabel: {
    color: "#D66349",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  scoreLabel: {
    color: "#183F36",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#183F36",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    marginBottom: 16,
  },
  photoFrame: {
    width: "100%",
    aspectRatio: 1.25,
    maxHeight: 360,
    backgroundColor: "#E5ECE6",
    borderColor: "#DCE4DE",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 18,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  sectionLabel: {
    color: "#5F716B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 9,
  },
  choices: {
    gap: 8,
  },
  choiceButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4DE",
    borderWidth: 1,
    borderRadius: 6,
  },
  correctChoice: {
    backgroundColor: "#DDF0E3",
    borderColor: "#318457",
  },
  wrongChoice: {
    backgroundColor: "#FCE3DF",
    borderColor: "#C94D3D",
  },
  inactiveChoice: {
    opacity: 0.72,
  },
  choiceNumber: {
    color: "#D66349",
    fontSize: 12,
    fontWeight: "700",
  },
  choiceText: {
    flex: 1,
    color: "#183F36",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  correctText: {
    color: "#246741",
  },
  wrongText: {
    color: "#A33E2C",
  },
  feedback: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "700",
  },
  nextButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#183F36",
    borderRadius: 6,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  emptyEyebrow: {
    color: "#D66349",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  emptyTitle: {
    color: "#183F36",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 10,
    color: "#5F716B",
    fontSize: 15,
    lineHeight: 22,
  },
  countControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 28,
  },
  countButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4DE",
    borderWidth: 1,
    borderRadius: 6,
  },
  countButtonDisabled: {
    opacity: 0.4,
  },
  countButtonText: {
    color: "#183F36",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "500",
  },
  countInput: {
    minWidth: 92,
    minHeight: 64,
    paddingHorizontal: 12,
    color: "#183F36",
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4DE",
    borderWidth: 1,
    borderRadius: 6,
  },
  countHint: {
    marginTop: 12,
    color: "#D66349",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  photoCount: {
    marginTop: 16,
    color: "#D66349",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
