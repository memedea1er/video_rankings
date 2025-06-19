const ratingFormModule = (function () {
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

        const ratingData = {
            startTime,
            endTime,
            startTimeStr,
            endTimeStr,
            rating,
            limb,
            needsVerification
        };

        if (!utils.dataValidation(ratingData)) {
            return;
        }

        videoRatingsModule.addRating(video, ratingData);
        ratingTableModule.loadRatingsForVideo(video);
        ratingTableModule.scrollTableToBottom();
        videoListModule.updateVideoStatus(video);
    }

    return {
        init
    };
})();