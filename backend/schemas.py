from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ── User Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)


class UserResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


# ── SymptomLog Schemas ────────────────────────────────────────────────────────

class VoiceLogRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class SymptomLogCreate(BaseModel):
    symptom: str
    severity: int = Field(..., ge=1, le=10)
    raw_text: Optional[str] = None


class SymptomLogResponse(BaseModel):
    id: int
    timestamp: datetime
    symptom: str
    severity: int
    raw_text: Optional[str]

    model_config = {"from_attributes": True}


# ── WeatherLog Schemas ────────────────────────────────────────────────────────

class WeatherLogCreate(BaseModel):
    pressure_hpa: float
    humidity: int = Field(..., ge=0, le=100)


class WeatherLogResponse(BaseModel):
    id: int
    timestamp: datetime
    pressure_hpa: float
    humidity: int

    model_config = {"from_attributes": True}


# ── BiometricLog Schemas ──────────────────────────────────────────────────────

class BiometricLogCreate(BaseModel):
    sleep_hours: float = Field(..., ge=0.0, le=24.0)
    hrv: int = Field(..., ge=0)


class BiometricLogResponse(BaseModel):
    id: int
    timestamp: datetime
    sleep_hours: float
    hrv: int

    model_config = {"from_attributes": True}


# ── Dashboard / Analytics Schemas ─────────────────────────────────────────────

class DashboardResponse(BaseModel):
    hrv_ms: int
    pressure_hpa: float
    sleep_hours: float
    system_latency_ms: int
    sensor_stability_pct: float


class CorrelationInsight(BaseModel):
    title: str
    icon: str
    confidence_pct: int
    description: str
    severity: str  # "high" | "medium" | "low"


class CorrelationsResponse(BaseModel):
    insights: list[CorrelationInsight]
    summary: str
    high_severity_episodes: int
    low_pressure_episodes: int
    low_sleep_episodes: int


class SeedResponse(BaseModel):
    message: str
    symptom_logs: int
    weather_logs: int
    biometric_logs: int
