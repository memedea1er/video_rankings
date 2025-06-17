const videoPlayerModule = (function() {
    let player, placeholder, content, titleElement;

    function init(videoPlayer, videoPlaceholder, videoContent, videoTitle, closeBtn) {
        player = videoPlayer;
        placeholder = videoPlaceholder;
        content = videoContent;
        titleElement = videoTitle;

        closeBtn.addEventListener('click', closeVideo);
    }

    function playVideo(filename) {
        placeholder.style.display = 'none';
        content.style.display = 'block';
        titleElement.textContent = filename;

        while (player.firstChild) {
            player.removeChild(player.firstChild);
        }

        const source = document.createElement('source');
        source.src = `/videos/${filename}`;
        source.type = `video/${filename.split('.').pop()}`;
        player.appendChild(source);

        player.load();
        player.play();

        ratingTableModule.loadRatingsForVideo(filename);
    }

    function closeVideo() {
        placeholder.style.display = 'flex';
        content.style.display = 'none';
        player.pause();
        player.currentTime = 0;

        while (player.firstChild) {
            player.removeChild(player.firstChild);
        }

        ratingTableModule.clearTable();
    }

    function getCurrentVideo() {
        return titleElement.textContent;
    }

    return {
        init,
        playVideo,
        getCurrentVideo
    };
})();