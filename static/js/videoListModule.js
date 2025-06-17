const videoListModule = (function() {
    let items = [];
    let buttons = [];

    function init(filterButtons, videoItems) {
        items = videoItems;
        buttons = filterButtons;
        setupEventListeners();
        setupFilterButtons();
    }

    function setupEventListeners() {
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.classList.contains('delete-rating-btn') ||
                    e.target.tagName === 'BUTTON' ||
                    e.target.tagName === 'INPUT') {
                    return;
                }

                const videoFile = this.dataset.video;
                videoPlayerModule.playVideo(videoFile);
            });
        });
    }

    function setupFilterButtons() {
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                const filter = this.dataset.filter;
                filterVideos(filter);
            });
        });
    }

    function updateVideoStatus(videoName) {
        const item = Array.from(items).find(item => item.dataset.video === videoName);
        if (!item) return;

        const hasRatings = videoRatingsModule.hasRatings(videoName);
        const needsVerificationCount = hasRatings ?
            videoRatingsModule.getVerificationCount(videoName) : 0;

        const statusSpan = item.querySelector('.rating-status');
        if (!statusSpan) return;

        if (hasRatings) {
            let statusHTML = `<span class="rated-part">Оценено (${videoRatingsModule.getRatingCount(videoName)})</span>`;

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

    function filterVideos(filter) {
        items.forEach(item => {
            const videoName = item.dataset.video;
            const hasRatings = videoRatingsModule.hasRatings(videoName);
            const needsVerificationCount = hasRatings ?
                videoRatingsModule.getVerificationCount(videoName) : 0;

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

            updateVideoStatus(videoName, hasRatings, needsVerificationCount);
        });
    }

    return {
        init,
        updateVideoStatus,
        filterVideos
    };
})();