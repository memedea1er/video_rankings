from flask import Flask, render_template, send_from_directory, request, jsonify
import os
import csv

app = Flask(__name__)
app.config['ALLOWED_EXTENSIONS'] = {'mp4'}
app.config['VIDEO_FOLDER'] = "C:\\Users\\mf\\Videos\\NVIDIA\\Desktop"
app.config['RATINGS_FILE'] = "ratings.csv"


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
def index():
    video_files = []
    if os.path.exists(app.config['VIDEO_FOLDER']):
        for filename in os.listdir(app.config['VIDEO_FOLDER']):
            if allowed_file(filename):
                video_files.append(filename)

    ratings = {}

    return render_template('index.html',
                           videos=video_files,
                           ratings=ratings,
                           initialRatings=ratings)


@app.route('/videos/<filename>')
def serve_video(filename):
    return send_from_directory(app.config['VIDEO_FOLDER'], filename)


@app.route('/api/export-ratings', methods=['POST'])
def export_ratings():
    try:
        ratings_data = request.json

        export_path = os.path.join(os.path.dirname(app.config['RATINGS_FILE']), app.config['RATINGS_FILE'])

        with open(export_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['video', 'id', 'startTime', 'endTime', 'rating', 'limb', 'needsVerification'])

            for video, ratings in ratings_data.items():
                for rating in ratings:
                    writer.writerow([
                        video,
                        rating.get('id', ''),
                        rating['startTimeStr'],
                        rating['endTimeStr'],
                        rating['rating'],
                        rating['limb'],
                        rating['needsVerification']
                    ])

        return jsonify({
            'status': 'success',
            'filename': app.config['RATINGS_FILE'],
            'message': f'Экспортировано {len(ratings_data)} видео с оценками'
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка экспорта: {str(e)}'
        }), 500


@app.route('/api/import-ratings', methods=['GET'])
def import_ratings():
    try:
        ratings_file = app.config['RATINGS_FILE']
        if not os.path.exists(ratings_file):
            return jsonify({'status': 'error', 'message': 'Файл оценок не найден'}), 404

        ratings_data = {}

        with open(ratings_file, 'r', encoding='utf-8') as f:
            csv_reader = csv.reader(f)
            next(csv_reader)  # Пропускаем заголовок

            for row in csv_reader:
                if len(row) < 6:
                    continue

                video_name = row[0]
                rating_id = row[1]
                start_time_str = row[2]
                end_time_str = row[3]
                rating = int(row[4])
                limb = int(row[5])
                needs_verification = row[6] == 'True' if len(row) > 6 else False

                if video_name not in ratings_data:
                    ratings_data[video_name] = []

                ratings_data[video_name].append({
                    'id': rating_id,  # Сохраняем ID
                    'startTime': time_to_seconds(start_time_str),
                    'endTime': time_to_seconds(end_time_str),
                    'startTimeStr': start_time_str,
                    'endTimeStr': end_time_str,
                    'rating': rating,
                    'limb': limb,
                    'needsVerification': needs_verification
                })

        return jsonify({
            'status': 'success',
            'data': ratings_data,
            'message': f'Импортировано {len(ratings_data)} видео с оценками'
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка импорта: {str(e)}'
        }), 500


def time_to_seconds(time_str):
    """Convert mm:ss to seconds"""
    parts = time_str.split(':')
    if len(parts) != 2:
        return 0
    try:
        minutes = int(parts[0])
        seconds = int(parts[1])
        return minutes * 60 + seconds
    except ValueError:
        return 0


if __name__ == '__main__':
    app.run(debug=True, port = 5003)
