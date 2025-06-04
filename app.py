from flask import Flask, render_template, send_from_directory, request, jsonify
import os
import csv

app = Flask(__name__)
app.config['ALLOWED_EXTENSIONS'] = {'mp4'}
app.config['VIDEO_FOLDER'] = "C:\\Users\\mf\\Videos\\NVIDIA\\Desktop"
app.config['RATINGS_FILE'] = "ratings.csv"

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def load_ratings():
    ratings = {}
    if os.path.exists(app.config['RATINGS_FILE']):
        with open(app.config['RATINGS_FILE'], 'r', newline='') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) >= 2:
                    ratings[row[0]] = int(row[1])
    return ratings

def save_ratings(ratings):
    with open(app.config['RATINGS_FILE'], 'w', newline='') as f:
        writer = csv.writer(f)
        for video, rating in ratings.items():
            writer.writerow([video, rating])


@app.route('/')
def index():
    video_files = []
    if os.path.exists(app.config['VIDEO_FOLDER']):
        for filename in os.listdir(app.config['VIDEO_FOLDER']):
            if allowed_file(filename):
                video_files.append(filename)

    ratings = load_ratings()
    return render_template('index.html', videos=video_files, ratings=ratings)


@app.route('/rate', methods=['POST'])
def rate_video():
    data = request.json
    video = data['video']
    rating = data['rating']

    ratings = load_ratings()
    ratings[video] = rating
    save_ratings(ratings)

    return jsonify({'status': 'success'})


@app.route('/videos/<filename>')
def serve_video(filename):
    return send_from_directory(app.config['VIDEO_FOLDER'], filename)

@app.route('/export', methods=['POST'])
def export_ratings():
    try:
        data = request.json
        ratings = data.get('ratings', {})
        ratings = {video: int(rating) for video, rating in ratings.items()}
        save_ratings(ratings)
        return jsonify({'status': 'saved'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)