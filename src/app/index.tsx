import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Camera</Text>
        <Text style={styles.title}>Frame</Text>
        <Text style={styles.subtitle}>
          Capture o momento e mantenha o melhor da sua memória em um só lugar.
        </Text>
      </View>

      <View style={styles.actions}>
        <Link href="/camera" asChild>
          <TouchableOpacity style={styles.primaryCard} activeOpacity={0.9}>
            <Text style={[styles.cardLabel, styles.primaryCardLabel]}>
              Câmera
            </Text>
            <Text style={[styles.cardTitle, styles.primaryCardTitle]}>
              Tirar foto
            </Text>
            <Text style={[styles.cardMeta, styles.primaryCardMeta]}>
              Abrir agora
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/gallery" asChild>
          <TouchableOpacity style={styles.secondaryCard} activeOpacity={0.9}>
            <Text style={[styles.cardLabel, styles.secondaryCardLabel]}>
              Biblioteca
            </Text>
            <Text style={[styles.cardTitle, styles.secondaryCardTitle]}>
              Minha galeria
            </Text>
            <Text style={[styles.cardMeta, styles.secondaryCardMeta]}>
              Ver fotos
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0EA",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 42,
  },

  heroCard: {
    backgroundColor: "#F9F7F4",
    borderWidth: 1,
    borderColor: "#E7DED4",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#7D7168",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1E272B",
    letterSpacing: -1.5,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#4F5B60",
    lineHeight: 24,
  },

  actions: {
    gap: 14,
  },

  primaryCard: {
    backgroundColor: "#1E272B",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },

  secondaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E1D8",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  primaryCardLabel: {
    color: "rgba(255,255,255,0.7)",
  },

  secondaryCardLabel: {
    color: "#7D7168",
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  primaryCardTitle: {
    color: "#FFFFFF",
  },

  secondaryCardTitle: {
    color: "#1E272B",
  },

  cardMeta: {
    marginTop: 8,
    fontSize: 14,
  },

  primaryCardMeta: {
    color: "rgba(255,255,255,0.76)",
  },

  secondaryCardMeta: {
    color: "#6A7479",
  },
});
