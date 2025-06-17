const utils = {
    timeToSeconds: function(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;

        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);

        if (isNaN(minutes) || isNaN(seconds)) return 0;

        return minutes * 60 + seconds;
    },

    secondsToTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }
};