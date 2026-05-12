import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function GoldText() {
  return (
    <View className="items-center justify-center mt-8">
      {/* Sombra detrás */}
      <Text style={styles.shadowText}>
        MESSIRVE TE SIRVE
      </Text>

      {/* Texto con gradiente */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <Text style={styles.text}>
            MESSIRVE TE SIRVE
          </Text>
        }
      >
        <LinearGradient
          colors={[
  "#4a3a1a", // sombra profunda
  "#8c6f3d", // transición oscura
  "#C9A96D", // color base
  "#f5e6c8", // brillo alto
  "#C9A96D", // regreso al base
  "#8c6f3d", // transición
  "#4a3a1a", // sombra
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.text, { opacity: 0 }]}>
            MESSIRVE TE SIRVE
          </Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 5,
  },

  // 👇 Simula box-shadow
  shadowText: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 5,
    color: "#000",
    opacity: 0.25,
    transform: [{ translateY: 3 }, { translateX: 3 }],
  },
});