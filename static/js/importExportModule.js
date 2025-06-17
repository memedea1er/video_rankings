const importExportModule = (function() {
    function init(exportButton, importButton) {
        exportButton.addEventListener('click', exportRatingsToCSV);
        importButton.addEventListener('click', importRatingsFromFile);
    }
    
    async function exportRatingsToCSV() {
        try {
            const ratingsToExport = videoRatingsModule.getAllRatings();

            if (!ratingsToExport || Object.keys(ratingsToExport).length === 0) {
                alert('Нет оценок для экспорта');
                return;
            }

            const response = await fetch('/api/export-ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingsToExport)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
            } else {
                alert(result.message || 'Ошибка экспорта');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Произошла ошибка при экспорте');
        }
    }
    
    async function importRatingsFromFile() {
        try {
            const response = await fetch('/api/import-ratings');
            const result = await response.json();

            if (response.ok) {
                videoRatingsModule.mergeRatings(result.data);
                videoListModule.filterVideos(document.querySelector('.filter-btn.active').dataset.filter);
                alert(result.message);
            } else {
                alert(result.message || 'Ошибка импорта');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Произошла ошибка при импорте');
        }
    }
    
    return {
        init
    };
})();