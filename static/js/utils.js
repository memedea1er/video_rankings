const utils = {
    timeToSeconds: function (timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;

        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);

        if (isNaN(minutes) || isNaN(seconds)) return 0;

        return minutes * 60 + seconds;
    },

    secondsToTime: function (seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    },

    dataValidation: function (ratingData) {
        const timeFormatRegex = /^(\d{1,2}):([0-5]\d)$/;

        if (isNaN(ratingData.startTime) || isNaN(ratingData.endTime)) {
            alert('Пожалуйста, введите корректное время в формате мм:сс');
            return false;
        }

        if (!timeFormatRegex.test(ratingData.startTimeStr) || !timeFormatRegex.test(ratingData.endTimeStr)) {
            alert('Пожалуйста, введите время в формате мм:сс (например 1:23 или 01:23)');
            return false;
        }

        if (isNaN(ratingData.rating) || isNaN(ratingData.limb)) {
            alert('Пожалуйста, введите корректные значения');
            return false;
        }

        if (ratingData.endTime <= ratingData.startTime) {
            alert('Конечное время должно быть больше начального');
            return false;
        }

        if (ratingData.startTime > 300 || ratingData.endTime > 300) {
            alert('Время должно быть меньше или равно 5:00');
            return false;
        }

        if (ratingData.rating < 1 || ratingData.rating > 5) {
            alert('Оценка должна быть от 1 до 5');
            return false;
        }

        if (ratingData.limb < 0 || ratingData.limb > 4) {
            alert('Конечность должна быть от 0 до 4');
            return false;
        }

        return true;
    }
};