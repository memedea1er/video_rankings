const ratingTableModule = (function () {
    const ratingsTableBody = document.getElementById('ratings-table-body');
    const tableHeaders = document.querySelectorAll('#ratings-table th');
    const timeHeaders = document.querySelectorAll('.ratings-table th:nth-child(1), .ratings-table th:nth-child(2)');
    const ratingsTable = document.getElementById('ratings-table');
    let currentSortColumn = null;
    let isCurrentSortAscending = null;
    let currentVideo = null; // Добавим для хранения текущего видео

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
                } else {
                    loadUnsortedRatings(currentVideo);
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
        const video = videoPlayerModule.getCurrentVideo();
        const header = tableHeaders[index];
        const pairedHeader = tableHeaders[pairedIndex];
        const currentClickCount = header.clickCount || 0;
        const newClickCount = currentClickCount + 1;
        const isAscending = newClickCount % 2 === 0;

        currentSortColumn = index;
        isCurrentSortAscending = isAscending;

        header.clickCount = newClickCount;
        pairedHeader.clickCount = newClickCount;

        updateSortArrows(index, pairedIndex, isAscending);
        loadRatingsForVideo(video);
    }

    function handleRegularSort(index) {
        const video = videoPlayerModule.getCurrentVideo();
        const header = tableHeaders[index];
        const currentClickCount = header.clickCount || 0;
        const newClickCount = currentClickCount + 1;
        const isAscending = newClickCount % 2 === 0;

        currentSortColumn = index;
        isCurrentSortAscending = isAscending;

        header.clickCount = newClickCount;

        updateSortArrows(index, null, isAscending);

        loadRatingsForVideo(video);
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

    function loadRatingsForVideo(video) {
        currentVideo = video; // Сохраняем текущее видео
        clearTable();

        let ratings = currentSortColumn === null || isCurrentSortAscending === null
            ? videoRatingsModule.getRatings(video)
            : videoRatingsModule.getSortedRatings(video, currentSortColumn, isCurrentSortAscending);

        ratings.forEach(rating => {
            addRatingToTable(rating);
        });
    }

    function addRatingToTable(ratingData) {
        const row = document.createElement('tr');
        row.dataset.ratingId = ratingData.id; // Сохраняем ID в атрибуте строки

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

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.className = 'edit-rating-btn';
        editBtn.addEventListener('click', () => toggleEditMode(row));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-rating-btn';
        deleteBtn.addEventListener('click', () => deleteRating(row));
        actionsCell.appendChild(deleteBtn);

        row.appendChild(actionsCell);
        ratingsTableBody.appendChild(row);
    }

    function deleteRating(row) {
        const ratingId = row.dataset.ratingId;
        if (row.classList.contains('editing')) {
            cancelEdit(row);
        } else {
            videoRatingsModule.deleteRating(currentVideo, ratingId);
            loadRatingsForVideo(currentVideo);
        }
    }

    function toggleEditMode(row) {
        if (row.classList.contains('editing')) {
            saveChanges(row);
        } else {
            enterEditMode(row);
            row.classList.add('editing');
        }
    }

    function enterEditMode(row) {
        const cells = row.querySelectorAll('td:not(:last-child)');

        cells.forEach((cell, i) => {
            const input = document.createElement('input');

            if (i === 0 || i === 1) {
                input.type = 'text';
                input.value = cell.textContent;
            } else if (i === 2 || i === 3) {
                input.type = 'number';
                input.value = cell.textContent;
            } else {
                input.type = 'checkbox';
                input.checked = cell.textContent === "Да";
            }

            cell.textContent = '';
            cell.appendChild(input);
        });

        row.querySelector('.edit-rating-btn').innerHTML = '💾';
        row.querySelector('.delete-rating-btn').innerHTML = '<span class="white-cross">❌</span>';
    }

    function saveChanges(row) {
        const ratingId = row.dataset.ratingId;
        const cells = row.querySelectorAll('td:not(:last-child)');
        const updatedData = {};

        updatedData.startTime = utils.timeToSeconds(cells[0].querySelector('input').value);
        updatedData.startTimeStr = cells[0].querySelector('input').value;
        updatedData.endTime = utils.timeToSeconds(cells[1].querySelector('input').value);
        updatedData.endTimeStr = cells[1].querySelector('input').value;
        updatedData.rating = parseInt(cells[2].querySelector('input').value);
        updatedData.limb = parseInt(cells[3].querySelector('input').value);
        updatedData.needsVerification = cells[4].querySelector('input').checked;

        if (!utils.dataValidation(updatedData)) return;

        videoRatingsModule.updateRating(currentVideo, ratingId, updatedData);
        loadRatingsForVideo(currentVideo);

        row.classList.remove('editing');
    }

    function cancelEdit(row) {
        const ratingId = row.dataset.ratingId;
        const rating = videoRatingsModule.getRating(currentVideo, ratingId);
        const cells = row.querySelectorAll('td:not(:last-child)');

        cells[0].textContent = rating.startTimeStr;
        cells[1].textContent = rating.endTimeStr;
        cells[2].textContent = rating.rating;
        cells[3].textContent = rating.limb;
        cells[4].textContent = rating.needsVerification ? "Да" : "Нет";
        cells[4].className = rating.needsVerification ? "needs-verification" : "verified";

        row.querySelector('.edit-rating-btn').innerHTML = '✏️';
        row.querySelector('.delete-rating-btn').innerHTML = '🗑️';

        row.classList.remove('editing');
    }

    function clearTable() {
        ratingsTableBody.innerHTML = '';
    }

    function loadUnsortedRatings(video) {
        currentSortColumn = null;
        isCurrentSortAscending = null;
        updateSortArrows(6, null, true);
        loadRatingsForVideo(video);
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
        loadUnsortedRatings,
        clearTable,
        scrollTableToBottom
    };
})();