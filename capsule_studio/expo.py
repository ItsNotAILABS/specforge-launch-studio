from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List


@dataclass
class ExpoApp:
    name: str
    slug: str
    entrypoint: str = "App.tsx"
    platforms: List[str] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        if self.platforms is None:
            self.platforms = ["ios", "android", "web"]

    def app_json(self) -> Dict[str, object]:
        return {
            "expo": {
                "name": self.name,
                "slug": self.slug,
                "version": "0.1.0",
                "orientation": "portrait",
                "scheme": self.slug,
                "platforms": self.platforms,
                "assetBundlePatterns": ["**/*"],
                "extra": {"capsuleStudio": True, "entrypoint": self.entrypoint},
            }
        }


def create_expo_capsule(root: Path, app: ExpoApp) -> Dict[str, str]:
    root.mkdir(parents=True, exist_ok=True)
    package = {
        "scripts": {
            "start": "expo start",
            "android": "expo start --android",
            "ios": "expo start --ios",
            "web": "expo start --web"
        },
        "dependencies": {
            "@expo/metro-runtime": "latest",
            "expo": "latest",
            "expo-status-bar": "latest",
            "react": "latest",
            "react-native": "latest",
            "react-native-web": "latest"
        },
        "devDependencies": {
            "@babel/core": "latest",
            "typescript": "latest"
        },
        "private": True
    }
    app_tsx = """import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Capsule Studio</Text>
      <Text style={styles.title}>Mobile Capsule Preview</Text>
      <Text style={styles.body}>Open this in Expo Go to preview a generated app capsule on a real device.</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090c', alignItems: 'center', justifyContent: 'center', padding: 24 },
  eyebrow: { color: '#d7b46d', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  title: { color: '#f4f0e7', fontSize: 34, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  body: { color: 'rgba(244,240,231,.7)', fontSize: 16, textAlign: 'center', lineHeight: 24 }
});
"""
    files = {
        "app.json": json.dumps(app.app_json(), indent=2) + "\n",
        "package.json": json.dumps(package, indent=2) + "\n",
        "App.tsx": app_tsx,
        "README.md": f"# {app.name}\n\nRun with Expo Go:\n\n```bash\nnpm install\nnpm run start\n```\n\nScan the QR code with Expo Go.\n",
        "capsule.mobile.json": json.dumps({"kind": "expo", "app": asdict(app), "preview": "expo-go"}, indent=2) + "\n",
    }
    for relative, content in files.items():
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    return {key: str(root / key) for key in files}
