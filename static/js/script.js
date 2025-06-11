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
    const importButton = document.getElementById('import-btn');
    const tableHeaders = document.querySelectorAll('#ratings-table th');
    const timeHeaders = document.querySelectorAll('.ratings-table th:nth-child(1), .ratings-table th:nth-child(2)');

    const videoRatings = {};
    Object.assign(videoRatings, initialRatings);

    // Загрузка данных из localStorage
    loadVideoRatings();

    // Обработчик клика по названию видео
    videoItems.forEach(item => {
        item.addEventListener('click', function (e) {
            if (e.target.classList.contains('delete-rating-btn') ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'INPUT') {
                return;
            }

            const videoFile = this.dataset.video;
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

    importButton.addEventListener('click', importRatingsFromFile);

    // Обработчики для сортировки таблицы
    tableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortTable(index);
        });
    });


    timeHeaders.forEach(header => {
        header.addEventListener('mouseenter', () => {
            timeHeaders.forEach(h => h.style.backgroundColor = '#e6e6e6');
        });

        header.addEventListener('mouseleave', () => {
            timeHeaders.forEach(h => h.style.backgroundColor = '#f2f2f2');
        });
    });

    // Функция для сортировки таблицы
    function sortTable(columnIndex) {
        const video = videoTitle.textContent;
        if (!video || !videoRatings[video]) return;

        const ratings = videoRatings[video];
        const tbody = ratingsTableBody;
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // Направление сортировки
        const isAscending = !tbody.dataset.sortAsc || tbody.dataset.sortAsc === 'false';
        tbody.dataset.sortAsc = isAscending;
        tbody.dataset.sortedBy = columnIndex;

        ratings.sort((a, b) => {
            let compareResult = 0;

            switch (columnIndex) {
                case 0: // Начало
                case 1: // Конец
                    compareResult = a.startTime - b.startTime;
                    if (columnIndex === 1) {
                        compareResult = a.endTime - b.endTime;
                    }
                    break;
                case 2: // Оценка
                    compareResult = a.rating - b.rating;
                    break;
                case 3: // Конечность
                    compareResult = a.limb - b.limb;
                    break;
                case 4: // Верификация
                    compareResult = (a.needsVerification === b.needsVerification) ? 0 :
                                     a.needsVerification ? -1 : 1;
                    break;
            }

            return isAscending ? compareResult : -compareResult;
        });

        loadRatingsForVideo(video);
    }

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
            const needsVerificationCount = hasRatings ?
                videoRatings[videoName].filter(r => r.needsVerification).length : 0;

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
                case 'needs-verification':
                    item.style.display = needsVerificationCount > 0 ? 'flex' : 'none';
                    break;
            }

            const statusSpan = item.querySelector('.rating-status');
            if (statusSpan) {
                if (hasRatings) {
                    let statusHTML = `<span class="rated-part">Оценено (${videoRatings[videoName].length})</span>`;

                    if (needsVerificationCount > 0) {
                        statusHTML += `, <span class="verification-part">Нужна верификация (${needsVerificationCount})</span>`;
                    }

                    statusSpan.innerHTML = statusHTML;
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

        // Время из мм:сс в секунды
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
        verificationCell.textContent = ratingData.needsVerification ? "Да" : "Нет";
        verificationCell.className = ratingData.needsVerification ? "needs-verification" : "verified";
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
            // Проверяем, есть ли сохраненная сортировка
            const sortedBy = ratingsTableBody.dataset.sortedBy;
            const sortAsc = ratingsTableBody.dataset.sortAsc === 'true';

            if (sortedBy) {
                videoRatings[video].sort((b, a) => {
                    let compareResult = 0;

                    switch (parseInt(sortedBy)) {
                        case 0:
                        case 1:
                            compareResult = b.startTime - a.startTime;
                            if (parseInt(sortedBy) === 1) {
                                compareResult = b.endTime - a.endTime;
                            }
                            break;
                        case 2:
                            compareResult = a.rating - b.rating;
                            break;
                        case 3:
                            compareResult = b.limb - a.limb;
                            break;
                        case 4:
                            compareResult = (a.needsVerification === b.needsVerification) ? 0 :
                                         b.needsVerification ? -1 : 1;
                            break;
                    }

                    return sortAsc ? compareResult : -compareResult;
                });
            }

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

    async function importRatingsFromFile() {
        try {
            const response = await fetch('/api/import-ratings');
            const result = await response.json();

            if (response.ok) {
                const existingRatings = JSON.parse(localStorage.getItem('videoRatings') || '{}');
                const mergedRatings = {...existingRatings, ...result.data};

                localStorage.setItem('videoRatings', JSON.stringify(mergedRatings));

                loadVideoRatings();
                filterVideos(document.querySelector('.filter-btn.active').dataset.filter);

                alert(result.message);
            } else {
                alert(result.message || 'Ошибка импорта');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Произошла ошибка при импорте');
        }
    }

    filterVideos('all');
});