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

            for video, ratings in ratings_data.items():
                for rating in ratings:
                    writer.writerow([
                        video,
                        # rating['startTime'],
                        # rating['endTime'],
                        rating['startTimeStr'],
                        rating['endTimeStr'],
                        rating['rating'],
                        rating['limb']
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


if __name__ == '__main__':
    app.run(debug=True)
