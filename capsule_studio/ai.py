from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class AIMessage:
    role: str
    content: str


@dataclass
class AIResult:
    ok: bool
    content: str
    provider: str
    error: Optional[str] = None


class BaseAIProvider:
    name = "base"

    def complete(self, messages: List[AIMessage], system: str = "") -> AIResult:
        raise NotImplementedError


class LocalEchoProvider(BaseAIProvider):
    name = "local-echo"

    def complete(self, messages: List[AIMessage], system: str = "") -> AIResult:
        last = messages[-1].content if messages else ""
        response = [
            "Capsule Studio local AI placeholder response.",
            "This provider is deterministic and offline-safe.",
            "Attach a real provider by setting CAPSULE_AI_PROVIDER and provider credentials.",
            "",
            "Input summary:",
            last[:2000],
        ]
        return AIResult(ok=True, content="\n".join(response), provider=self.name)


class OpenAICompatibleProvider(BaseAIProvider):
    name = "openai-compatible"

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None, model: Optional[str] = None) -> None:
        self.base_url = (base_url or os.getenv("CAPSULE_AI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("CAPSULE_AI_API_KEY")
        self.model = model or os.getenv("CAPSULE_AI_MODEL") or "gpt-4.1-mini"

    def complete(self, messages: List[AIMessage], system: str = "") -> AIResult:
        if not self.api_key:
            return AIResult(ok=False, content="", provider=self.name, error="missing OPENAI_API_KEY or CAPSULE_AI_API_KEY")
        payload_messages = []
        if system:
            payload_messages.append({"role": "system", "content": system})
        payload_messages.extend({"role": item.role, "content": item.content} for item in messages)
        payload = json.dumps({"model": self.model, "messages": payload_messages, "temperature": 0.2}).encode("utf-8")
        request = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=payload,
            method="POST",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"},
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            return AIResult(ok=True, content=content, provider=self.name)
        except (urllib.error.URLError, KeyError, IndexError, json.JSONDecodeError) as exc:
            return AIResult(ok=False, content="", provider=self.name, error=str(exc))


class CapsuleAI:
    def __init__(self) -> None:
        provider = os.getenv("CAPSULE_AI_PROVIDER", "local").lower()
        if provider in {"openai", "openai-compatible", "api"}:
            self.provider: BaseAIProvider = OpenAICompatibleProvider()
        else:
            self.provider = LocalEchoProvider()

    def generate_code(self, prompt: str, language: str, context: str = "") -> AIResult:
        system = (
            "You are Capsule Studio's code generation engine. Return practical production-oriented code, "
            "clear file boundaries when needed, and do not claim deployment happened unless a deploy tool confirms it."
        )
        user = f"Language: {language}\nContext:\n{context}\n\nRequest:\n{prompt}"
        return self.provider.complete([AIMessage(role="user", content=user)], system=system)

    def review_capsule(self, manifest_json: Dict[str, object]) -> AIResult:
        system = "You review Capsule Studio manifests for deployment risks and missing runtime details."
        return self.provider.complete([AIMessage(role="user", content=json.dumps(manifest_json, indent=2))], system=system)
