const ratingTableModule = (function () {
    const ratingsTableBody = document.getElementById('ratings-table-body');
    const tableHeaders = document.querySelectorAll('#ratings-table th');
    const timeHeaders = document.querySelectorAll('.ratings-table th:nth-child(1), .ratings-table th:nth-child(2)');
    const ratingsTable = document.getElementById('ratings-table');
    let currentSortColumn = null;
    let isCurrentSortAscending = null;

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
                    const video = videoPlayerModule.getCurrentVideo();
                    loadUnsortedRatings(video);
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
        clearTable();

        let ratings;

        if (currentSortColumn === null && isCurrentSortAscending === null) {
            ratings = videoRatingsModule.getRatings(video);
        }
        else {
            ratings = videoRatingsModule.getSortedRatings(video, currentSortColumn, isCurrentSortAscending);
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
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-rating-btn';
        deleteBtn.addEventListener('click', function () {
            deleteCancelToggle(row, index, video);
        });

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.className = 'edit-rating-btn';
        editBtn.addEventListener('click', function () {
            toggleEditMode(row, index, video);
        });

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);

        ratingsTableBody.appendChild(row);
    }

    function deleteCancelToggle(row, index, video) {
        if (row.classList.contains('editing')) {
            cancelEdit(row, index, video);
            row.classList.remove('editing');
        } else {
            videoRatingsModule.deleteRating(video, index);
            loadRatingsForVideo(video);
        }
    }

    function toggleEditMode(row, index, video) {
        const isEditing = row.classList.contains('editing');

        if (isEditing) {
            saveChanges(row, index, video);
        } else {
            enterEditMode(row);
            row.classList.add('editing');
        }
    }

    function enterEditMode(row) {
        const cells = row.querySelectorAll('td:not(:last-child)');

        cells.forEach((cell, i) => {
            const originalContent = cell.textContent;
            const input = document.createElement('input');

            if (i === 0 || i === 1) {
                input.type = 'text';
                input.value = originalContent;
            } else if (i === 2 || i === 3) {
                input.type = 'number';
                input.value = originalContent;
            } else {
                input.type = 'checkbox';
                originalContent === "Да" ? input.checked = true : input.checked = false;
            }
            cell.textContent = '';
            cell.appendChild(input);
        });

        const editBtn = row.querySelector('.edit-rating-btn');
        if (editBtn) {
            editBtn.innerHTML = '💾';
        }
        const deleteBtn = row.querySelector('.delete-rating-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '<span class="white-cross">❌</span>';
        }
    }

    function saveChanges(row, index, video) {
        const cells = row.querySelectorAll('td:not(:last-child)');
        const updatedData = {};

        updatedData.startTime = utils.timeToSeconds(cells[0].querySelector('input').value);
        updatedData.startTimeStr = cells[0].querySelector('input').value;
        updatedData.endTime = utils.timeToSeconds(cells[1].querySelector('input').value);
        updatedData.endTimeStr = cells[1].querySelector('input').value;
        updatedData.rating = cells[2].querySelector('input').value;
        updatedData.limb = cells[3].querySelector('input').value;
        updatedData.needsVerification = cells[4].querySelector('input').checked;

        if (!utils.dataValidation(updatedData)) {
            return;
        }

        cells.forEach((cell, i) => {
            let value;
            const input = cell.querySelector('input');
            value = input.value;

            cell.textContent = i === 4 ? (input.checked ? 'Да' : 'Нет') : value;
            if (i === 4) {
                cell.className = input.checked ? "needs-verification" : "verified";
            }
        });

        videoRatingsModule.updateRating(video, index, updatedData);

        const editBtn = row.querySelector('.edit-rating-btn');
        if (editBtn) {
            editBtn.innerHTML = '✏️';
        }
        const deleteBtn = row.querySelector('.delete-rating-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '🗑️';
        }

        loadRatingsForVideo(video);

        row.classList.remove('editing');
    }

    function cancelEdit(row, index, video) {
        if (!row.classList.contains('editing')) return;

        const originalRating = videoRatingsModule.getRating(video, index);

        const cells = row.querySelectorAll('td:not(:last-child)');

        cells[0].textContent = originalRating.startTimeStr;
        cells[1].textContent = originalRating.endTimeStr;
        cells[2].textContent = originalRating.rating;
        cells[3].textContent = originalRating.limb;
        cells[4].textContent = originalRating.needsVerification ? "Да" : "Нет";
        cells[4].className = originalRating.needsVerification ? "needs-verification" : "verified";

        const editBtn = row.querySelector('.edit-rating-btn');
        if (editBtn) {
            editBtn.innerHTML = '✏️';
        }
        const deleteBtn = row.querySelector('.delete-rating-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '🗑️';
        }

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