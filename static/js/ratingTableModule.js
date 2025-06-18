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
        scrollTableToBottom();
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
            row.classList.remove('editing');
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
            }
            else if (i === 2 || i === 3) {
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
            deleteBtn.innerHTML = `
                <svg width="18" height="14" viewBox="-2 -4 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L1 12M1 1L12 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>`
        }
    }

    function saveChanges(row, index, video) {
        const cells = row.querySelectorAll('td:not(:last-child)');
        const updatedData = {};

        cells.forEach((cell, i) => {
            let value;
            const input = cell.querySelector('input');
            value = input.value;

            switch(i) {
                case 0: updatedData.startTime = utils.timeToSeconds(value); updatedData.startTimeStr = value; break;
                case 1: updatedData.endTime = utils.timeToSeconds(value); updatedData.endTimeStr = value; break;
                case 2: updatedData.rating = value; break;
                case 3: updatedData.limb = value; break;
                case 4: updatedData.needsVerification = input.checked; break;
            }

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