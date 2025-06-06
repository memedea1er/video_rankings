document.addEventListener('DOMContentLoaded', function () {
    const videoContainer = document.getElementById('video-container');
    const videoPlaceholder = document.getElementById('video-placeholder');
    const videoContent = document.getElementById('video-content');
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    const videoTitles = document.querySelectorAll('.video-title');
    const videoRatingInput = document.getElementById('video-rating-input');
    const exportButton = document.getElementById('export-btn');
    const closeVideoBtn = document.getElementById('close-video-btn');

    const ratings = {};
    Object.assign(ratings, initialRatings);

    // Обработчик клика по названию видео
    videoTitles.forEach(title => {
        title.addEventListener('click', function () {
            const videoFile = this.textContent;
            playVideo(videoFile);
        });
    });

    // Обработчик клика по кнопке закрытия видео
    closeVideoBtn.addEventListener('click', closeVideo);

    // Обработчик изменения оценки в видео-контейнере
    videoRatingInput.addEventListener('change', function () {
        updateVideoRating();
    });

    exportButton.addEventListener('click', function () {
        exportRatingsToCSV();
    });

    function playVideo(filename) {
        videoPlaceholder.style.display = 'none';
        videoContent.style.display = 'block';

        videoTitle.textContent = filename;

        while (videoPlayer.firstChild) {
            videoPlayer.removeChild(videoPlayer.firstChild);
        }

        const source = document.createElement('source');
        source.src = `/videos/${filename}`;
        source.type = `video/${filename.split('.').pop()}`;
        videoPlayer.appendChild(source);

        const currentRating = ratings[filename] || 0;
        videoRatingInput.value = currentRating;
        videoRatingInput.setAttribute('data-video', filename);

        videoPlayer.load();
        videoPlayer.play();
    }

    function closeVideo() {
        videoPlaceholder.style.display = 'flex';
        videoContent.style.display = 'none';
        videoPlayer.pause();
        videoPlayer.currentTime = 0;

        // Очищаем источник видео
        while (videoPlayer.firstChild) {
            videoPlayer.removeChild(videoPlayer.firstChild);
        }
    }

    function updateVideoRating() {
        const video = videoRatingInput.getAttribute('data-video');
        const rating = parseInt(videoRatingInput.value);

        if (!isNaN(rating)) {
            ratings[video] = rating;

            const statusSpan = document.querySelector(`.rating-status[data-video="${video}"]`);
            if (statusSpan) {
                statusSpan.textContent = (rating >= 1) ? 'Оценено' : 'Не оценено';
            }
        }
    }

    function exportRatingsToCSV() {
        const ratingsToExport = {};

        for (const [video, rating] of Object.entries(ratings)) {
            if (1 <= rating && rating <= 5) {
                ratingsToExport[video] = rating;
            }
        }


        fetch('/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ratings: ratingsToExport})
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'saved') {
                    alert('Оценки успешно экспортированы');
                }
            })
            .catch(error => {
                console.error('Ошибка при экспорте:', error);
                alert('Произошла ошибка при экспорте');
            });
    }
});