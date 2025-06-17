const ratingTableModule = (function () {
    const ratingsTableBody = document.getElementById('ratings-table-body');
    const tableHeaders = document.querySelectorAll('#ratings-table th');
    const timeHeaders = document.querySelectorAll('.ratings-table th:nth-child(1), .ratings-table th:nth-child(2)');
    const ratingsTable = document.getElementById('ratings-table');

    function init() {
        setupSortingHeaders();
        setupTimeHeadersHover();
    }

    function setupSortingHeaders() {
        tableHeaders.forEach((header, index) => {
            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'sort-arrow';
            header.appendChild(arrowSpan);

            header.addEventListener('click', () => {
                const isStartTime = index === 0;
                const isEndTime = index === 1;
                const isAction = index === 5;

                if (isStartTime || isEndTime) {
                    handleTimeSort(index, isStartTime ? 1 : 0);
                } else if (!isAction) {
                    handleRegularSort(index);
                }
            });
        });
    }

    function setupTimeHeadersHover() {
        timeHeaders.forEach(header => {
            header.addEventListener('mouseenter', () => {
                timeHeaders.forEach(h => h.style.backgroundColor = '#e6e6e6');
            });

            header.addEventListener('mouseleave', () => {
                timeHeaders.forEach(h => h.style.backgroundColor = '#f2f2f2');
            });
        });
    }

    function handleTimeSort(index, pairedIndex) {
        const header = tableHeaders[index];
        const pairedHeader = tableHeaders[pairedIndex];
        const currentClickCount = header.clickCount || 0;
        const newClickCount = currentClickCount + 1;
        const isAscending = newClickCount % 2 === 0;

        header.clickCount = newClickCount;
        pairedHeader.clickCount = newClickCount;

        updateSortArrows(index, pairedIndex, isAscending);
        sortTable(index, isAscending);
        scrollTableToBottom();
    }

    function handleRegularSort(index) {
        const header = tableHeaders[index];
        const currentClickCount = header.clickCount || 0;
        const newClickCount = currentClickCount + 1;
        const isAscending = newClickCount % 2 === 0;

        header.clickCount = newClickCount;

        updateSortArrows(index, null, isAscending);
        sortTable(index, isAscending);
        scrollTableToBottom();
    }

    function updateSortArrows(index, pairedIndex, isAscending) {
        tableHeaders.forEach((h, idx) => {
            const arrow = h.querySelector('.sort-arrow');
            if (idx === index || idx === pairedIndex) {
                arrow.textContent = isAscending ? ' ↑' : ' ↓';
                arrow.style.visibility = 'visible';
            } else {
                arrow.textContent = '';
                arrow.style.visibility = 'hidden';
                h.clickCount = 0;
            }
        });
    }

    function sortTable(columnIndex, isAscending) {
        const video = videoPlayerModule.getCurrentVideo();
        if (!video || !videoRatingsModule.hasRatings(video)) return;

        const ratings = videoRatingsModule.getSortedRatings(video, columnIndex, isAscending);
        loadRatingsForVideo(video, ratings);
    }

    function loadRatingsForVideo(video, ratings = null) {
        clearTable();

        if (!ratings) {
            ratings = videoRatingsModule.getRatings(video);
        }

        ratings.forEach((rating, index) => {
            addRatingToTable(rating, index);
        });
    }

    function addRatingToTable(ratingData, index) {
        const video = videoPlayerModule.getCurrentVideo();
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
            videoRatingsModule.deleteRating(video, index);
            loadRatingsForVideo(video);
        });
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);

        ratingsTableBody.appendChild(row);
        scrollTableToBottom();
    }

    function clearTable() {
        ratingsTableBody.innerHTML = '';
    }

    function scrollTableToBottom() {
        if (ratingsTable) {
            const lastRow = ratingsTableBody.lastElementChild;
            if (lastRow) {
                lastRow.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        }
    }

    return {
        init,
        loadRatingsForVideo,
        clearTable,
    };
})();