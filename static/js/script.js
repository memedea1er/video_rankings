document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    const closeBtn = document.querySelector('.close-btn');
    const videoTitles = document.querySelectorAll('.video-title');
    const modalRatingInput = document.getElementById('modal-rating-input');
    const exportButton = document.getElementById('export-btn');

    // Хранилище для оценок
    const ratingsStorage = {};

    // Обработчик клика по названию видео
    videoTitles.forEach(title => {
        title.addEventListener('click', function () {
            const videoFile = this.textContent;
            playVideo(videoFile);
        });
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', function () {
        closeModal();
    });

    // Обработчик изменения оценки в модальном окне
    modalRatingInput.addEventListener('change', function () {
        updateModalRating();
    });

    exportButton.addEventListener('click', function () {
        exportRatingsToCSV();
    });

    function playVideo(filename) {
        videoTitle.textContent = filename;

        while (videoPlayer.firstChild) {
            videoPlayer.removeChild(videoPlayer.firstChild);
        }

        const source = document.createElement('source');
        source.src = `/videos/${filename}`;
        source.type = `video/${filename.split('.').pop()}`;
        videoPlayer.appendChild(source);

        const ratingInput = document.querySelector(`.rating-input[data-video="${filename}"]`);
        const currentRating = ratingInput ? ratingInput.value : 0;
        modalRatingInput.value = currentRating;
        modalRatingInput.setAttribute('data-video', filename);

        ratingsStorage[filename] = currentRating;

        modal.style.display = 'block';
        videoPlayer.load();
        videoPlayer.play();
    }

    function updateModalRating() {
        const video = modalRatingInput.getAttribute('data-video');
        const rating = parseInt(modalRatingInput.value);
        ratingsStorage[video] = rating;

        const listInput = document.querySelector(`.rating-input[data-video="${video}"]`);
        if (listInput) {
            listInput.value = rating;
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    }

    function exportRatingsToCSV() {
        const ratingsToExport = {};

        document.querySelectorAll('.rating-input').forEach(input => {
            const video = input.getAttribute('data-video');
            const rating = parseInt(input.value);
            if (rating >= 1 && rating <= 5) {
                ratingsToExport[video] = rating;
            }
        });

        Object.assign(ratingsToExport, ratingsStorage);

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
                    alert('Оценки экспортированы в CSV');
                }
            })
            .catch(error => {
                console.error('Ошибка при экспорте:', error);
            });
    }
});