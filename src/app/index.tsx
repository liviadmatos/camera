import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera+</Text>

      <Text style={styles.subtitle}>
        Capture, explore e registre.
      </Text>

      <Link href="/camera" style={styles.button}>
        📸 Tirar foto
      </Link>
      <Link href="/gallery" style={styles.button}>
  🖼️ Minha galeria
</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F1E8',
    padding: 20,
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 40,
  },

  button: {
    backgroundColor: '#222',
    color: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});