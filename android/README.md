# JARVIS — Native Android 15 Application (Kotlin + Jetpack Compose)

This directory contains the production-ready native Android project for **JARVIS — Adaptive Personal Trainer**, written in **Kotlin** and **Jetpack Compose (Material 3)**.

---

## 📱 Features Included
* **Android 15 Edge-to-Edge System Architecture**
* **5 Futuristic Light Theme Matrix** (Titanium Cyan, Quantum Cobalt, Emerald Kinetic, Solar Amber, Neural Violet)
* **Samsung Galaxy Health & Wearable Telemetry** (HRV, Live BPM, Sleep Stages, Step progress)
* **Gemini AI Biomechanical Personal Trainer** (`com.google.ai.client.generativeai`)
* **PEAKD Flexibility Intensity Autoregulation** (Main 45m, Lite 30m, Survival 15m)
* **7-Day Periodized Overload Program & 1RM Lab**
* **Caloric & Macronutrient Food Engine**
* **Long-Term Coaching Memory Vault**

---

## 🚀 Building & Installing via ADB

### Prerequisites
1. Android Studio Ladybug (or newer) / Android SDK 35+
2. JDK 17 or JDK 21
3. Android device running Android 8.0+ (optimized for Android 15) with **Developer Options** and **USB Debugging** enabled.

---

### Step 1: Connect your Android Device
Connect your phone via USB cable (or Wireless ADB) and verify the connection:
```bash
adb devices
```
*You should see your device listed, e.g.: `14091FDF600000 device`.*

---

### Step 2: Build the Debug APK
From the `android/` directory, run:
```bash
# On Linux / macOS:
./gradlew assembleDebug

# On Windows:
gradlew.bat assembleDebug
```
The compiled APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

---

### Step 3: Install on Physical Android Device via ADB
Run the following command to install the APK directly to your phone:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

### Step 4: Launch JARVIS on your Device
Launch the application directly from terminal:
```bash
adb shell am start -n com.jarvis.fitness/.MainActivity
```

---

### Step 5: (Optional) Grant Voice Coaching Permissions via ADB
```bash
adb shell pm grant com.jarvis.fitness android.permission.RECORD_AUDIO
adb shell pm grant com.jarvis.fitness android.permission.BODY_SENSORS
```

---

## 🛠️ Project Structure
```
android/
├── app/
│   ├── build.gradle.kts
│   ├── proguard-rules.pro
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml
│           ├── java/com/jarvis/fitness/
│           │   ├── MainActivity.kt
│           │   ├── model/Models.kt
│           │   ├── service/
│           │   │   ├── GeminiService.kt
│           │   │   └── GalaxyHealthService.kt
│           │   └── ui/
│           │       ├── screens/
│           │       │   ├── TodayScreen.kt
│           │       │   ├── ProgramScreen.kt
│           │       │   ├── NutritionScreen.kt
│           │       │   ├── AICoachScreen.kt
│           │       │   └── MemoryScreen.kt
│           │       └── theme/
│           │           ├── Color.kt
│           │           ├── Theme.kt
│           │           └── Type.kt
│           └── res/
├── gradle/
│   └── libs.versions.toml
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```
