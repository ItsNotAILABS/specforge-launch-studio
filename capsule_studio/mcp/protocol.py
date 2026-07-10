from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class JSONRPCRequest:
    id: Optional[Any]
    method: str
    params: Dict[str, Any]


class JSONRPCError(Exception):
    def __init__(self, code: int, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def parse_request(line: str) -> JSONRPCRequest:
    try:
        payload = json.loads(line)
    except json.JSONDecodeError as exc:
        raise JSONRPCError(-32700, f"Parse error: {exc}") from exc
    if not isinstance(payload, dict):
        raise JSONRPCError(-32600, "Invalid request")
    method = payload.get("method")
    if not isinstance(method, str):
        raise JSONRPCError(-32600, "Missing method")
    params = payload.get("params") or {}
    if not isinstance(params, dict):
        raise JSONRPCError(-32602, "Invalid params")
    return JSONRPCRequest(id=payload.get("id"), method=method, params=params)


def success_response(request_id: Optional[Any], result: Any) -> str:
    return json.dumps({"jsonrpc": "2.0", "id": request_id, "result": result}, separators=(",", ":"))


def error_response(request_id: Optional[Any], code: int, message: str) -> str:
    return json.dumps({"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}, separators=(",", ":"))
