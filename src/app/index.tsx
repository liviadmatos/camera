import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>DIÁRIO VISUAL</Text>
        <Text style={styles.title}>Frame</Text>
        <Text style={styles.subtitle}>
          Guarde os momentos que fazem o seu dia valer a pena.
        </Text>
      </View>

      <View style={styles.actions}>
        <Link href="/camera" asChild>
          <TouchableOpacity style={styles.primaryCard} activeOpacity={0.9}>
            <Text style={[styles.cardLabel, styles.primaryCardLabel]}>
              Câmera
            </Text>
            <Text style={[styles.cardTitle, styles.primaryCardTitle]}>
              Abrir câmera
            </Text>
            <Text style={[styles.cardMeta, styles.primaryCardMeta]}>
              Registrar um momento
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
              Rever suas fotos
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/game" asChild>
          <TouchableOpacity style={styles.gameCard} activeOpacity={0.9}>
            <Text style={[styles.cardLabel, styles.gameCardLabel]}>
              ENTRE AMIGOS
            </Text>
            <Text style={[styles.cardTitle, styles.gameCardTitle]}>
              Desafio de legendas
            </Text>
            <Text style={[styles.cardMeta, styles.gameCardMeta]}>
              Quem conhece melhor a história?
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
    backgroundColor: "#F1F4F0",
    paddingHorizontal: 24,
    paddingTop: 62,
    paddingBottom: 36,
  },

  heroCard: {
    paddingTop: 22,
    paddingBottom: 34,
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#D66349",
    textTransform: "uppercase",
    marginBottom: 12,
  },

  title: {
    fontSize: 52,
    fontWeight: "800",
    color: "#183F36",
    letterSpacing: 0,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#5F716B",
    lineHeight: 25,
    maxWidth: 300,
  },

  actions: {
    gap: 12,
  },

  primaryCard: {
    backgroundColor: "#183F36",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  secondaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE4DE",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  primaryCardLabel: {
    color: "#B9D0C5",
  },

  secondaryCardLabel: {
    color: "#D66349",
  },

  cardTitle: {
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  primaryCardTitle: {
    color: "#FFFFFF",
  },

  secondaryCardTitle: {
    color: "#183F36",
  },

  gameCard: {
    backgroundColor: "#D66349",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  gameCardLabel: {
    color: "#FCE9E2",
  },

  gameCardTitle: {
    color: "#FFFFFF",
  },

  cardMeta: {
    marginTop: 8,
    fontSize: 14,
  },

  primaryCardMeta: {
    color: "#D4E2DB",
  },

  secondaryCardMeta: {
    color: "#5F716B",
  },

  gameCardMeta: {
    color: "#FCE9E2",
  },
});
