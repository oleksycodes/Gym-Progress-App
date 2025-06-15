document.addEventListener("DOMContentLoaded", function () {
    const trainingLabel = document.getElementById("training-label");
    const exerciseList = document.getElementById("exercise-list");

    const trainingABC = [
        { name: "Wyciskanie na sztandze", sets: 4 },
        { name: "Odciążony gumą przysiad na suwnicy HES", sets: 2 },
        { name: "Pół-sumo martwe ciągi na sztandze", sets: 3 },
        { name: "Ściąganie drążka na wyciągu górnym podchwyt", sets: 2 },
        { name: "Wiosłowanie hantlą w opadzie tłowia jednorącz", sets: 1 },
        { name: "Wyciskanie na maszynie Gym80 dominacja triceps", sets: 2 },
        { name: "Wznosy na maszynie Gym80", sets: 2 },
        { name: "Uginanie łokcia hantlami oburącz w leżeniu na skosie", sets: 2 },
        { name: "Spięcia brzucha na gąbce", sets: 2 }
    ];

    const trainingD = [
        { name: "Wyciskanie hantli skos 25'", sets: 2 },
        { name: "Wyciskanie nad głowę maszyna", sets: 2 },
        { name: "Ściąganie drążka wyciąg górny nachwyt", sets: 2 },
        { name: "Przyciąganie drążka wyciąg poziomy neutral wąski", sets: 1 },
        { name: "Wznosy na hantlach w oparciu o ławkę", sets: 2 },
        { name: "Uginanie łokcia w oparciu młotkowo jednorącz", sets: 2 },
        { name: "Wyprosty łokcia w siedzeniu jednorącz", sets: 2 }
    ];

    const rotation = ["A", "B", "C", "D"];
    const today = new Date();
    const day = today.getDay();

    function getCurrentTrainingIndex() {
        const start = new Date("2025-06-02");
        const now = new Date();
        let count = 0;

        while (start <= now) {
            const day = start.getDay();
            if (day === 1 || day === 3 || day === 5) count++; 
            start.setDate(start.getDate() + 1);
        }

        return (count - 1) % 4; 
    }

    function renderCardioDay() {
        trainingLabel.textContent = "Cardio";
        exerciseList.innerHTML = `
            <div class="exercise-block">
                <p><strong>Cardio:</strong> 1 godzina, tętno 130–140</p>
            </div>
        `;
    }

    function renderRestDay() {
        trainingLabel.textContent = "Rest day";
        exerciseList.innerHTML = `
            <div class="exercise-block">
                <p><strong>Dzień regeneracji</strong> – odpoczynek bez treningu</p>
            </div>
        `;
    }

    function renderStrengthDay(type, exercises) {
        trainingLabel.textContent = `Trening ${type}`;
        exerciseList.innerHTML = '';

        exercises.forEach((exercise, idx) => {
            const block = document.createElement("div");
            block.className = "exercise-block";

            block.innerHTML = `
                <label>${idx + 1}. ${exercise.name} (${exercise.sets} serie)</label>
                ${[...Array(exercise.sets)].map((_, i) => `
                    <div class="set-group">
                        <input type="number" placeholder="Ciężar (kg)" />
                        <input type="number" placeholder="Powtórzenia" />
                    </div>
                `).join("")}
            `;
            exerciseList.appendChild(block);
        });
    }

    if (day === 2 || day === 4 || day === 6) {
        renderCardioDay(); 
    } else if (day === 0) {
        renderRestDay(); 
    } else {
        const trainingIndex = getCurrentTrainingIndex();
        const type = rotation[trainingIndex];
        const exercises = (type === "D") ? trainingD : trainingABC;
        renderStrengthDay(type, exercises);
    }
});
