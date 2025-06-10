document.addEventListener('DOMContentLoaded', function () {
    const videoPlaceholder = document.getElementById('video-placeholder');
    const videoContent = document.getElementById('video-content');
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    const videoTitles = document.querySelectorAll('.video-title');
    const exportButton = document.getElementById('export-btn');
    const closeVideoBtn = document.getElementById('close-video-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const videoItems = document.querySelectorAll('.video-item');
    const addRatingBtn = document.getElementById('add-rating-btn');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const ratingValueInput = document.getElementById('rating-value');
    const limbValueSelect = document.getElementById('limb-value');
    const ratingsTableBody = document.getElementById('ratings-table-body');

    const videoRatings = {};
    Object.assign(videoRatings, initialRatings);

    // Загрузка данных из localStorage
    loadVideoRatings();

    // Обработчик клика по названию видео
    videoTitles.forEach(title => {
        title.addEventListener('click', function () {
            const videoFile = this.textContent;
            playVideo(videoFile);
        });
    });

    // Обработчик клика по кнопке закрытия видео
    closeVideoBtn.addEventListener('click', closeVideo);

    // Обработчик для кнопки добавления оценки
    addRatingBtn.addEventListener('click', addRating);

    exportButton.addEventListener('click', exportRatingsToCSV);

    // Обработчики для кнопок фильтрации
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            filterVideos(filter);
        });
    });

    // Функция для преобразования времени из формата мм:сс в секунды
    function timeToSeconds(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;

        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);

        if (isNaN(minutes) || isNaN(seconds)) return 0;

        return minutes * 60 + seconds;
    }

    // Функция для преобразования секунд в формат мм:сс
    function secondsToTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }

    function filterVideos(filter) {
        videoItems.forEach(item => {
            const videoName = item.dataset.video;
            const hasRatings = videoRatings[videoName] && videoRatings[videoName].length > 0;

            switch (filter) {
                case 'all':
                    item.style.display = 'flex';
                    break;
                case 'rated':
                    item.style.display = hasRatings ? 'flex' : 'none';
                    break;
                case 'unrated':
                    item.style.display = hasRatings ? 'none' : 'flex';
                    break;
            }

            const statusSpan = item.querySelector('.rating-status');
            if (statusSpan) {
                if (hasRatings) {
                    statusSpan.textContent = `Оценено (${videoRatings[videoName].length})`;
                    statusSpan.classList.add('rated');
                    item.dataset.rated = 'true';
                } else {
                    statusSpan.textContent = 'Не оценено';
                    statusSpan.classList.remove('rated');
                    item.dataset.rated = 'false';
                }
            }
        });
    }

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

        videoPlayer.load();
        videoPlayer.play();

        loadRatingsForVideo(filename);
    }

    function closeVideo() {
        videoPlaceholder.style.display = 'flex';
        videoContent.style.display = 'none';
        videoPlayer.pause();
        videoPlayer.currentTime = 0;

        while (videoPlayer.firstChild) {
            videoPlayer.removeChild(videoPlayer.firstChild);
        }

        ratingsTableBody.innerHTML = '';
    }


    function addRating() {
        const video = videoTitle.textContent;
        if (!video) return;

        const startTimeStr = startTimeInput.value;
        const endTimeStr = endTimeInput.value;
        const rating = parseInt(ratingValueInput.value);
        const limb = parseInt(limbValueSelect.value);
        const needsVerification = document.getElementById('verification-checkbox').checked;

        // Преобразуем время из мм:сс в секунды
        const startTime = timeToSeconds(startTimeStr);
        const endTime = timeToSeconds(endTimeStr);

        if (isNaN(startTime) || isNaN(endTime)) {
            alert('Пожалуйста, введите корректное время в формате мм:сс');
            return;
        }

        if (isNaN(rating) || isNaN(limb)) {
            alert('Пожалуйста, введите корректные значения');
            return;
        }

        if (endTime <= startTime) {
            alert('Конечное время должно быть больше начального');
            return;
        }

        if (startTime > 300 || endTime > 300) {
            alert('Время должно быть меньше или равно 5:00');
            return;
        }

        if (rating < 1 || rating > 5) {
            alert('Оценка должна быть от 1 до 5');
            return;
        }

        if (limb < 0 || limb > 4) {
            alert('Конечность должна быть от 0 до 4');
            return;
        }

        const ratingData = {
            startTime,
            endTime,
            startTimeStr,
            endTimeStr,
            rating,
            limb,
            needsVerification
        };

        if (!videoRatings[video]) {
            videoRatings[video] = [];
        }
        videoRatings[video].push(ratingData);
        saveVideoRatings();

        addRatingToTable(ratingData, videoRatings[video].length - 1);

        // Сбрасываем чекбокс после добавления
        document.getElementById('verification-checkbox').checked = false;

        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        filterVideos(activeFilter);
    }

    function addRatingToTable(ratingData, index) {
        const video = videoTitle.textContent;
        if (!video) return;

        const row = document.createElement('tr');

        const startCell = document.createElement('td');
        startCell.textContent = ratingData.startTimeStr;
        row.appendChild(startCell);

        const endCell = document.createElement('td');
        endCell.textContent = ratingData.endTimeStr;
        row.appendChild(endCell);

        const ratingCell = document.createElement('td');
        ratingCell.textContent = ratingData.rating;
        row.appendChild(ratingCell);

        const limbCell = document.createElement('td');
        limbCell.textContent = ratingData.limb;
        row.appendChild(limbCell);

        const verificationCell = document.createElement('td');
        const verificationCheckbox = document.createElement('input');
        verificationCheckbox.type = 'checkbox';
        verificationCheckbox.checked = ratingData.needsVerification || false;
        verificationCheckbox.addEventListener('change', function() {
            videoRatings[video][index].needsVerification = this.checked;
            saveVideoRatings();
        });
        verificationCell.appendChild(verificationCheckbox);
        row.appendChild(verificationCell);

        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'delete-rating-btn';
        deleteBtn.addEventListener('click', function () {
            deleteRating(video, index);
        });
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);

        ratingsTableBody.appendChild(row);

        row.scrollIntoView({behavior: 'smooth', block: 'end'});
    }


    function deleteRating(video, index) {
        if (videoRatings[video] && videoRatings[video][index]) {
            videoRatings[video].splice(index, 1);
            saveVideoRatings();
            loadRatingsForVideo(video);

            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            filterVideos(activeFilter);
        }
    }

    function loadRatingsForVideo(video) {
        ratingsTableBody.innerHTML = '';

        if (videoRatings[video]) {
            videoRatings[video].forEach((rating, index) => {
                rating.startTimeStr = secondsToTime(rating.startTime);
                rating.endTimeStr = secondsToTime(rating.endTime);
                addRatingToTable(rating, index);
            });
        }
    }

    function loadVideoRatings() {
        const savedRatings = localStorage.getItem('videoRatings');
        if (savedRatings) {
            try {
                const parsed = JSON.parse(savedRatings);
                Object.assign(videoRatings, parsed);

                for (const video in videoRatings) {
                    videoRatings[video].forEach(rating => {
                        rating.startTimeStr = secondsToTime(rating.startTime);
                        rating.endTimeStr = secondsToTime(rating.endTime);
                    });
                }
            } catch (e) {
                console.error('Error loading ratings:', e);
            }
        }
    }

    function saveVideoRatings() {
        localStorage.setItem('videoRatings', JSON.stringify(videoRatings));
    }

    async function exportRatingsToCSV() {
        try {
            let ratingsToExport = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key === 'videoRatings') {
                    ratingsToExport = JSON.parse(localStorage.getItem(key));
                    break;
                }
            }

            if (!ratingsToExport || Object.keys(ratingsToExport).length === 0) {
                alert('Нет оценок для экспорта');
                return;
            }

            // Отправляем на бэкенд
            const response = await fetch('/api/export-ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingsToExport)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
            } else {
                alert(result.message || 'Ошибка экспорта');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Произошла ошибка при экспорте');
        }
    }

    filterVideos('all');
});