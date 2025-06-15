from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()

class Measurement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    waist = db.Column(db.Float)
    hips = db.Column(db.Float)
    chest = db.Column(db.Float)
    thigh = db.Column(db.Float)
    calf = db.Column(db.Float)
    arm = db.Column(db.Float)
    beltline = db.Column(db.Float)

class ClientLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    log_date = db.Column(db.Date, nullable=False, default=date.today, unique=True)
    weight = db.Column(db.Float)
    sleep_duration = db.Column(db.Float)
    wake_time = db.Column(db.Time)
    bed_time = db.Column(db.Time)
    training = db.Column(db.String(1))
    hunger = db.Column(db.Integer)
    stress = db.Column(db.Integer)
    note = db.Column(db.Text)
