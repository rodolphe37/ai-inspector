"""Pydantic response models. Field names use camelCase on the wire
to match the TypeScript frontend."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class FingerprintOut(CamelModel):
    id: str
    name: str
    provider: str
    type: str
    version: str
    status: str
    description: str
    last_updated: str
    confidence: int
    detection_method: str
    target_content: str
    coverage: str
    references: list[str] = []
