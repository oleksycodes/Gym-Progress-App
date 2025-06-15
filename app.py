from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_migrate import Migrate
from sqlalchemy import desc
from models import db, Measurement, ClientLog
from config import Config
from datetime import datetime, date, time, timedelta

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
migrate = Migrate(app, db)


@app.route('/')
def home():
    logs = ClientLog.query.order_by(ClientLog.log_date.desc()).limit(4).all()
    return render_template('index.html', logs=logs)

@app.route('/dzienniczek')
def diary_calendar():
    return redirect(url_for('calendar_view'))

@app.route('/dzienniczek/wpis', methods=['GET'])
def diary_form():
    selected_date = request.args.get('data', date.today().isoformat())
    return render_template('diary_form.html', selected_date=selected_date)


@app.route('/api/logs', methods=['POST'])
def add_or_update_log():
    data = request.json
    log_date = date.fromisoformat(data['log_date'])
    log = ClientLog.query.filter_by(log_date=log_date).first()

    if not log:
        log = ClientLog(log_date=log_date)

    log.weight = data.get('weight')
    log.sleep_duration = data.get('sleep_duration')
    log.wake_time = time.fromisoformat(data.get('wake_time'))
    log.bed_time = time.fromisoformat(data.get('bed_time'))
    log.training = data.get('training')
    log.hunger = data.get('hunger')
    log.stress = data.get('stress')
    log.note = data.get('note')

    db.session.add(log)
    db.session.commit()
    return jsonify({"message": "Log saved successfully."})

@app.route('/api/logs/<log_date>', methods=['GET'])
def get_log(log_date):
    log = ClientLog.query.filter_by(log_date=date.fromisoformat(log_date)).first()
    if log:
        return jsonify({
            "id": log.id,
            "log_date": log.log_date.isoformat(),
            "weight": log.weight,
            "sleep_duration": log.sleep_duration,
            "wake_time": log.wake_time.isoformat() if log.wake_time else None,
            "bed_time": log.bed_time.isoformat() if log.bed_time else None,
            "training": log.training,
            "hunger": log.hunger,
            "stress": log.stress,
            "note": log.note
        })
    else:
        return jsonify({"message": "No entry for this date."}), 404
    
@app.route('/kalendarz')
def calendar_view():
    return render_template('calendar.html', page_title="Kalendarz")

@app.route('/dzienniczek/<string:day>')
def diary_entry(day):
    log = ClientLog.query.filter_by(log_date=day).first()
    return render_template('diary_day.html', log=log, selected_date=day)
    
@app.route('/api/client-log', methods=['POST'])
def add_client_log():
    try:
        data = request.json

        new_log = ClientLog(
            log_date=datetime.strptime(data['log_date'], '%Y-%m-%d').date(),
            weight=float(data['weight']),
            sleep_duration=float(data['sleep_duration']),
            wake_time=datetime.strptime(data['wake_time'], '%H:%M').time(),
            bed_time=datetime.strptime(data['bed_time'], '%H:%M').time(),
            training=data['training'],
            hunger=int(data['hunger']),
            stress=int(data['stress']),
            note=data.get('note', '')
        )

        db.session.add(new_log)
        db.session.commit()
        return jsonify({'message': 'Zapisano log'}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Błąd: {str(e)}'}), 500


@app.route('/cwiczenia')
def exercises():
    return render_template('exercises.html', page_title="Ćwiczenia")

@app.route('/pomiary')
def measurements():
    return render_template('measurements.html', page_title="Pomiary")

@app.route('/api/measurements', methods=['POST'])
def add_measurement():
    data = request.json
    measurement = Measurement(
        date=datetime.utcnow(),  
        waist=data.get('waist'),
        hips=data.get('hips'),
        chest=data.get('chest'),
        thigh=data.get('thigh'),
        calf=data.get('calf'),
        arm=data.get('arm'),
        beltline=data.get('beltline')
    )
    db.session.add(measurement)
    db.session.commit()
    return jsonify({"message": "Measurement added"}), 201

@app.route('/api/measurements', methods=['GET'])
def get_measurements():
    measurements = Measurement.query.order_by(Measurement.date.desc()).all()
    return jsonify([
        {
            "date": m.date.isoformat(),
            "waist": m.waist,
            "hips": m.hips,
            "chest": m.chest,
            "thigh": m.thigh,
            "calf": m.calf,
            "arm": m.arm,
            "beltline": m.beltline
        } for m in measurements
    ])

@app.route('/wszystkie-pomiary')
def all_measurements():
    measurements = Measurement.query.order_by(Measurement.date.desc()).all()
    return render_template('all_measurements.html', measurements=measurements)

@app.route('/ostatnie-7-dni')
def last_7_days():
    today = datetime.today().date()
    days = [(today - timedelta(days=i)) for i in range(7)]
    days.sort()

    logs_dict = {log.log_date: log for log in ClientLog.query.filter(ClientLog.log_date.in_(days)).all()}

    logs = []
    for day in days:
        log = logs_dict.get(day)
        logs.append({
            'date': day,
            'weight': log.weight if log else '',
            'sleep_duration': log.sleep_duration if log else '',
            'bed_time': log.bed_time.strftime('%H:%M') if log and log.bed_time else '',
            'wake_time': log.wake_time.strftime('%H:%M') if log and log.wake_time else '',
            'training': log.training if log else '',
            'hunger': log.hunger if log else '',
            'stress': log.stress if log else '',
            'note': log.note if log else ''
        })

    return render_template('last_7_days.html', logs=logs)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8500, debug=True)