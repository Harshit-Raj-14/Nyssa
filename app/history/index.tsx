import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const MenstrualCupAlert = () => {
  const router = useRouter();
  const [sound, setSound] = useState<Audio.Sound | null>(null); 
  const [buzzerActive, setBuzzerActive] = useState(false); 

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const playBuzzer = async () => {
      if (buzzerActive) return; 
      setBuzzerActive(true);

      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/buzzer.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      setSound(sound);
      await sound.playAsync();

      Alert.alert("Menstrual Cup Alert", "Menstrual cup is filled. Take it out.", [
        {
          text: "OK",
          onPress: ()=>stopBuzzer(),
        },
      ]);
    };

    timer = setTimeout(playBuzzer, 8000); // Trigger after 8 seconds

    return () => {
      clearTimeout(timer); 
      stopBuzzer(); 
    };
  }, []);

  const stopBuzzer = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setBuzzerActive(false); // Reset flag
    router.push("/home"); // Navigate back to home page
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a8e2d", "#146922"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menstrual Cup Alert</Text>
        </View>

        {/* Menstrual Cup Image Covering Full Screen */}
        <Image
          source={require("../../assets/cup.png")}
          style={styles.cupImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    height: 80,
    width: "100%",
    position: "absolute",
    top: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
    marginTop: 40,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111111",
  },
  cupImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default MenstrualCupAlert;
