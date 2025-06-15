document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('measurement-form');
    const lastMeasurement = document.getElementById('last-measurement');

    async function loadLastMeasurement() {
        try {
            const response = await fetch('/api/measurements');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const measurements = await response.json();

            if (!Array.isArray(measurements)) {
                throw new Error('Otrzymano nieprawidłowy format danych');
            }

            if (measurements.length > 0) {
                const last = measurements[0];
                lastMeasurement.innerHTML = `
                    <div><strong>Data:</strong> ${new Date(last.date).toLocaleDateString('pl-PL')}</div>
                    ${last.waist ? `<div><strong>Talia:</strong> ${last.waist} cm</div>` : ''}
                    ${last.hips ? `<div><strong>Biodra:</strong> ${last.hips} cm</div>` : ''}
                    ${last.chest ? `<div><strong>Klatka:</strong> ${last.chest} cm</div>` : ''}
                    ${last.thigh ? `<div><strong>Udo:</strong> ${last.thigh} cm</div>` : ''}
                    ${last.calf ? `<div><strong>Łydka:</strong> ${last.calf} cm</div>` : ''}
                    ${last.arm ? `<div><strong>Ramię:</strong> ${last.arm} cm</div>` : ''}
                    ${last.beltline ? `<div><strong>Pas:</strong> ${last.beltline} cm</div>` : ''}
                `;
            } else {
                lastMeasurement.innerHTML = 'Brak danych pomiarowych';
            }
        } catch (error) {
            console.error('Błąd ładowania danych:', error);
            lastMeasurement.innerHTML = `
                <div class="error">Nie udało się załadować danych</div>
                <div class="error-details">${error.message}</div>
            `;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Zapisywanie...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            for (const [key, value] of Object.entries(data)) {
                if (!value || isNaN(value)) {
                    throw new Error(`Pole ${key} musi zawierać prawidłową liczbę`);
                }
            }

            const response = await fetch('/api/measurements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Błąd serwera: ${response.status}`);
            }

            form.reset();
            await loadLastMeasurement();
            showNotification('Pomiary zapisane pomyślnie!', 'success');

        } catch (error) {
            console.error('Błąd:', error);
            showNotification('Błąd zapisu danych', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    function showNotification(message, type) {
        const container = document.getElementById('notifications-container');
        container.innerHTML = '';

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }, 100);
    }

    loadLastMeasurement();
});
