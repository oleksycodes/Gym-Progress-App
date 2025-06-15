document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('diary-form');

    const logDateInput = document.getElementById('log_date');
    const today = new Date().toISOString().split('T')[0];
    logDateInput.value = today;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/client-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Wystąpił błąd przy zapisie danych.');
            }

            alert('Dzienniczek zapisany pomyślnie!');
            form.reset();
            logDateInput.value = today;

        } catch (error) {
            alert(`Błąd: ${error.message}`);
        }
    });
});
