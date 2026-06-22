from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    symptom = Column(String, nullable=False)
    severity = Column(Integer, nullable=False)
    raw_text = Column(String, nullable=True)


class WeatherLog(Base):
    __tablename__ = "weather_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    pressure_hpa = Column(Float, nullable=False)
    humidity = Column(Integer, nullable=False)


class BiometricLog(Base):
    __tablename__ = "biometric_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    sleep_hours = Column(Float, nullable=False)
    hrv = Column(Integer, nullable=False)
