document.addEventListener('DOMContentLoaded', function () {
    // Инициализация элементов управления
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
    const importButton = document.getElementById('import-btn');

    // Инициализация модулей
    videoPlayerModule.init(videoPlayer, videoPlaceholder, videoContent, videoTitle, closeVideoBtn);
    videoListModule.init(filterButtons, videoItems, videoTitles);
    ratingTableModule.init();
    ratingFormModule.init(addRatingBtn, startTimeInput, endTimeInput, ratingValueInput, limbValueSelect);
    importExportModule.init(exportButton, importButton);

    // Загрузка начальных данных
    videoRatingsModule.loadVideoRatings();
    videoListModule.filterVideos('all');
});