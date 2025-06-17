const ratingFormModule = (function() {
    function init(addRatingBtn) {
        addRatingBtn.addEventListener('click', addRating);
    }

    function addRating() {
        const video = videoPlayerModule.getCurrentVideo();
        if (!video) return;

        const startTimeStr = document.getElementById('start-time').value;
        const endTimeStr = document.getElementById('end-time').value;
        const rating = parseInt(document.getElementById('rating-value').value);
        const limb = parseInt(document.getElementById('limb-value').value);
        const needsVerification = document.getElementById('verification-checkbox').checked;

        const startTime = utils.timeToSeconds(startTimeStr);
        const endTime = utils.timeToSeconds(endTimeStr);

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

        videoRatingsModule.addRating(video, ratingData);
        ratingTableModule.loadRatingsForVideo(video);
        videoListModule.updateVideoStatus(video);
    }

    return {
        init
    };
})();