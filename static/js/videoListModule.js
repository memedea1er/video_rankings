const videoListModule = (function() {
    let allItems = [];
    let currentItems = [];
    let buttons = [];
    let currentPage = 1;
    let totalPages = null;
    const itemsPerPage = 3;
    let currentFilter = 'all';

    function init(filterButtons, videoItems) {
        allItems = Array.from(videoItems);
        buttons = filterButtons;
        setupEventListeners();
        setupFilterButtons();
        setupPagination();
        updateDisplay();
    }

    function setupEventListeners() {
        document.getElementById('prev-page').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                updateDisplay();
            }
        });

        document.getElementById('next-page').addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                updateDisplay();
            }
        });

        document.getElementById('to-page').addEventListener('click', function() {
            const inputPage = document.getElementById('page-input').value;
            console.log(inputPage)
            if (inputPage > 0 && inputPage <= totalPages) {
                currentPage = inputPage;
                updateDisplay();
            }
            else {
                alert(`Введите номер страницы от 1 до ${totalPages}`);
            }
        });

        document.getElementById('video-list').addEventListener('click', function(e) {
            const item = e.target.closest('.video-item');
            if (!item) return;

            if (e.target.classList.contains('delete-rating-btn') ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'INPUT') {
                return;
            }

            const videoFile = item.dataset.video;
            videoPlayerModule.playVideo(videoFile);
        });
    }

    function setupFilterButtons() {
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                currentFilter = this.dataset.filter;
                currentPage = 1;
                updateDisplay();
            });
        });
    }

    function setupPagination() {
        document.getElementById('prev-page').disabled = currentPage <= 1;
        document.getElementById('next-page').disabled = currentPage >= totalPages;
    }

    function updateDisplay() {
        currentItems = allItems.filter(item => {
            const videoName = item.dataset.video;
            const hasRatings = videoRatingsModule.hasRatings(videoName);
            const needsVerificationCount = hasRatings ?
                videoRatingsModule.getVerificationCount(videoName) : 0;

            switch (currentFilter) {
                case 'all': return true;
                case 'rated': return hasRatings;
                case 'unrated': return !hasRatings;
                case 'needs-verification': return needsVerificationCount > 0;
                default: return true;
            }
        });

        totalPages = Math.ceil(currentItems.length / itemsPerPage);
        document.getElementById('page-info').textContent = `Страница ${currentPage} из ${totalPages}`;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
        document.getElementById('page-input').placeholder = `1...${totalPages}`;

        allItems.forEach(item => item.style.display = 'none');

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = currentItems.slice(startIndex, endIndex);

        pageItems.forEach(item => {
            item.style.display = 'flex';
            updateItemStatus(item);
        });

        setupPagination();
    }

    function updateItemStatus(item) {
        const videoName = item.dataset.video;
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

    function updateVideoStatus(videoName) {
        const item = allItems.find(item => item.dataset.video === videoName);
        if (!item) return;

        updateItemStatus(item);

        if (item.style.display === 'flex') {
            updateDisplay();
        }
    }

    function filterVideos(filter) {
        currentFilter = filter;
        currentPage = 1;
        updateDisplay();
    }

    return {
        init,
        updateVideoStatus,
        filterVideos
    };
})();