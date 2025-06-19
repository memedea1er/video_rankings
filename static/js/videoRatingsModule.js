const videoRatingsModule = (function () {
    const videoRatings = {};

    function loadVideoRatings() {
        const savedRatings = localStorage.getItem('videoRatings');
        if (savedRatings) {
            try {
                const parsed = JSON.parse(savedRatings);
                Object.assign(videoRatings, parsed);

                for (const video in videoRatings) {
                    videoRatings[video].forEach(rating => {
                        rating.startTimeStr = utils.secondsToTime(rating.startTime);
                        rating.endTimeStr = utils.secondsToTime(rating.endTime);
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

    function addRating(video, ratingData) {
        if (!videoRatings[video]) {
            videoRatings[video] = [];
        }
        ratingData.id = Date.now().toString();
        videoRatings[video].push(ratingData);
        saveVideoRatings();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        videoListModule.filterVideos(activeFilter);
    }

    function deleteRating(video, id) {
        if (videoRatings[video]) {
            const index = videoRatings[video].findIndex(r => r.id === id);
            if (index !== -1) {
                videoRatings[video].splice(index, 1);
                saveVideoRatings();
                const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                videoListModule.filterVideos(activeFilter);
            }
        }
    }

    function updateRating(video, id, ratingData) {
        if (videoRatings[video]) {
            const index = videoRatings[video].findIndex(r => r.id === id);
            if (index !== -1) {
                ratingData.id = id;
                videoRatings[video][index] = ratingData;
                saveVideoRatings();
                const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                videoListModule.filterVideos(activeFilter);
            }
        }
    }

    function getRatings(video) {
        return videoRatings[video] || [];
    }

    function getRating(video, id) {
        if (videoRatings[video]) {
            return videoRatings[video].find(r => r.id === id);
        }
        return null;
    }

    function getRatingCount(video) {
        return videoRatings[video] ? videoRatings[video].length : 0;
    }

    function getVerificationCount(video) {
        return videoRatings[video] ?
            videoRatings[video].filter(r => r.needsVerification).length : 0;
    }

    function hasRatings(video) {
        return videoRatings[video] && videoRatings[video].length > 0;
    }

    function getSortedRatings(video, columnIndex, isAscending) {
        if (!videoRatings[video]) return [];

        const ratings = [...videoRatings[video]];

        ratings.sort((a, b) => {
            let compareResult = 0;

            switch (columnIndex) {
                case 0: // Начало
                case 1: // Конец
                    compareResult = b.startTime + b.endTime - a.startTime - a.endTime;
                    break;
                case 2: // Оценка
                    compareResult = b.rating - a.rating;
                    break;
                case 3: // Конечность
                    compareResult = b.limb - a.limb;
                    break;
                case 4: // Верификация
                    compareResult = (a.needsVerification === b.needsVerification) ? 0 :
                        a.needsVerification ? -1 : 1;
                    break;
            }
            return isAscending ? compareResult : -compareResult;
        });

        return ratings;
    }

    function getAllRatings() {
        return videoRatings;
    }

    function mergeRatings(newRatings) {
        for (const video in newRatings) {
            if (!videoRatings[video]) {
                videoRatings[video] = [];
            }

            // Объединяем оценки, сохраняя уникальность ID
            newRatings[video].forEach(newRating => {
                if (!videoRatings[video].some(r => r.id === newRating.id)) {
                    videoRatings[video].push(newRating);
                }
            });
        }
        saveVideoRatings();
    }

    return {
        loadVideoRatings,
        addRating,
        deleteRating,
        updateRating,
        getRatings,
        getRating,
        getRatingCount,
        getVerificationCount,
        hasRatings,
        getSortedRatings,
        getAllRatings,
        mergeRatings
    };
})();