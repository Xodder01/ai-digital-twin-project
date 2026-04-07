let charts = {};

// Custom plugin for Doughnut center text
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function (chart) {
        if (chart.config.options.elements && chart.config.options.elements.center) {
            var w = chart.width, h = chart.height, ctx = chart.ctx;
            ctx.restore();
            var fontSize = (h / 80).toFixed(2);
            ctx.font = "bold " + fontSize + "em Outfit, sans-serif";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#2d3748";

            var text = chart.data.datasets[0].data[0] + "%",
                textX = Math.round((w - ctx.measureText(text).width) / 2),
                textY = h / 2;

            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    }
};

Chart.register(centerTextPlugin);

function initDoughnut(ctxId, color) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Score', 'Remaining'],
            datasets: [{
                data: [0, 100],
                backgroundColor: [color, '#e2e8f0'],
                borderWidth: 0,
                cutout: '75%',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            elements: { center: true },
            plugins: { tooltip: { enabled: false }, legend: { display: false } },
            animation: { animateScale: true, duration: 1000 }
        }
    });
}

function initSparkline(ctxId, color) {
    const ctx = document.getElementById(ctxId).getContext('2d');

    // Gradient fill
    let gradient = ctx.createLinearGradient(0, 0, 0, 60);
    gradient.addColorStop(0, color + '55'); // e.g. rgba(color, 0.3)
    gradient.addColorStop(1, color + '00');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                data: [60, 65, 62, 70, 68, 72],
                borderColor: color,
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: {
                x: { display: true, grid: { display: false }, ticks: { font: { size: 10 }, color: '#a0aec0' } },
                y: { display: false, min: 50, max: 100 }
            }
        }
    });
}

function initMainLineChart(ctxId) {
    const ctx = document.getElementById(ctxId).getContext('2d');

    let gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(61, 181, 184, 0.3)');
    gradient.addColorStop(1, 'rgba(61, 181, 184, 0.0)');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Productivity',
                data: [75, 78, 73, 80, 76, 75, 78],
                borderColor: '#3db5b8',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#3db5b8',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#3db5b8',
                    padding: 10,
                    titleFont: { family: 'Outfit', size: 13 },
                    bodyFont: { family: 'Outfit', size: 14, weight: 'bold' },
                    displayColors: false,
                    callbacks: { label: (ctx) => `${ctx.raw}%` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#718096', font: { family: 'Outfit' } } },
                y: { grid: { color: '#e2e8f0', drawBorder: false }, ticks: { color: '#718096', stepSize: 10 }, min: 50, max: 100 }
            }
        }
    });
}

function initBarChart(ctxId) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['4-5h', '6-7h', '8+ h'],
            datasets: [
                {
                    label: 'Sleep',
                    data: [40, 55, 72],
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4
                },
                {
                    label: 'Productivity',
                    data: [55, 70, 85],
                    backgroundColor: '#60a5fa',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#a0aec0', font: { size: 10 } } },
                y: { display: false }
            }
        }
    });
}

function initPieChart(ctxId) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Study', 'Screen Time'],
            datasets: [{
                data: [60, 40],
                backgroundColor: ['#8b5cf6', '#60a5fa'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Outfit', size: 11 } } }
            }
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    // Initialize Dashboard Charts
    charts['prodChart'] = initDoughnut('prodChart', '#3db5b8');
    charts['focusSparkline'] = initSparkline('focusSparkline', '#48bb78');
    charts['weeklyLineChart'] = initMainLineChart('weeklyLineChart');
    charts['sleepBarChart'] = initBarChart('sleepBarChart');
    charts['studyPieChart'] = initPieChart('studyPieChart');

    const form = document.getElementById('predictionForm');
    const predictBtn = document.getElementById('predictBtn');
    const whatIfBtn = document.getElementById('whatIfBtn');

    async function makePrediction(isWhatIf = false) {
        if (!isWhatIf) {
            predictBtn.classList.add('loading');
            document.getElementById('scanningState').classList.remove('hidden');
            document.getElementById('terminalText').innerText = "Analyzing habits...";
        } else {
            whatIfBtn.innerText = "Processing...";
            document.getElementById('terminalText').innerText = "Simulating optimal twin...";
            document.getElementById('scanningState').classList.remove('hidden');
        }

        let data = {
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            academic_level: document.getElementById('academic_level').value,
            study_hours: parseFloat(document.getElementById('study_hours').value),
            self_study_hours: parseFloat(document.getElementById('self_study_hours').value),
            online_classes_hours: parseFloat(document.getElementById('online_classes_hours').value),
            social_media_hours: parseFloat(document.getElementById('social_media_hours').value),
            gaming_hours: parseFloat(document.getElementById('gaming_hours').value),
            sleep_hours: parseFloat(document.getElementById('sleep_hours').value),
            screen_time_hours: parseFloat(document.getElementById('screen_time_hours').value),
            exercise_minutes: parseInt(document.getElementById('exercise_minutes').value),
            caffeine_intake_mg: parseInt(document.getElementById('caffeine_intake_mg').value),
            internet_quality: document.getElementById('internet_quality').value,
            mental_health_score: parseInt(document.getElementById('mental_health_score').value),
            part_time_job: parseInt(document.getElementById('part_time_job').value),
            upcoming_deadline: parseInt(document.getElementById('upcoming_deadline').value)
        };

        if (isWhatIf) {
            data.sleep_hours = Math.max(data.sleep_hours, 8);
            data.screen_time_hours = Math.min(data.screen_time_hours, 4);
            data.gaming_hours = 0;
            data.study_hours = Math.max(data.study_hours, 6);
            data.exercise_minutes = Math.max(data.exercise_minutes, 60);

            // Update UI sliders
            document.getElementById('sleep_hours').value = data.sleep_hours;
            document.getElementById('sl_val').textContent = data.sleep_hours;
            document.getElementById('screen_time_hours').value = data.screen_time_hours;
            document.getElementById('st_val').textContent = data.screen_time_hours;
            document.getElementById('gaming_hours').value = data.gaming_hours;
            document.getElementById('gm_val').textContent = data.gaming_hours;
            document.getElementById('study_hours').value = data.study_hours;
            document.getElementById('sh_val').textContent = data.study_hours;
            document.getElementById('exercise_minutes').value = data.exercise_minutes;
            document.getElementById('ex_val').textContent = data.exercise_minutes;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("API request failed");
            const result = await response.json();

            // Reveal Results Content
            document.getElementById('resultsContent').classList.remove('hidden');
            document.getElementById('scanningState').classList.add('hidden');
            whatIfBtn.style.display = "inline-block";

            // Update Cards & Numbers
            const pScore = Math.round(result.predictions.productivity_score);
            const fScore = Math.round(result.predictions.focus_index);

            // Animate Numbers
            document.getElementById('prodNumber').textContent = pScore;
            document.getElementById('focusNumber').textContent = fScore;

            // Update Doughnut
            const pChart = charts['prodChart'];
            pChart.data.datasets[0].data = [pScore, 100 - pScore];
            pChart.update();

            // Update Sparkline
            const fChart = charts['focusSparkline'];
            let hist = fChart.data.datasets[0].data;
            hist.shift(); hist.push(fScore); // Move window forward
            fChart.update();

            // Update Main Line Chart
            const mChart = charts['weeklyLineChart'];
            let mHist = mChart.data.datasets[0].data;
            mHist.shift(); mHist.push(pScore);
            mChart.update();

            // Update Pie Chart dynamically based on Study vs Screen
            const studyTotal = data.study_hours + data.self_study_hours + data.online_classes_hours;
            const screenTotal = data.screen_time_hours;
            const sChart = charts['studyPieChart'];
            sChart.data.datasets[0].data = [studyTotal.toFixed(1), screenTotal.toFixed(1)];
            sChart.update();

            // Burnout Card
            const burnoutVal = document.getElementById('burnoutValue');
            const stressVal = document.getElementById('stressValue');
            const burnoutCardNode = document.querySelector('.burnout-kpi');

            burnoutVal.textContent = result.predictions.burnout_risk;
            if (result.predictions.burnout_risk === "High Risk" || result.predictions.stress_level === "High") {
                burnoutCardNode.style.background = "linear-gradient(to bottom, #fff5f5, #fed7d7)";
                burnoutVal.style.color = "#e53e3e";
                stressVal.innerHTML = `<i data-lucide="alert-circle"></i> High Stress`;
                stressVal.style.background = "rgba(229, 62, 62, 0.1)";
                stressVal.style.color = "#e53e3e";
            } else {
                burnoutCardNode.style.background = "linear-gradient(to bottom, #f0fff4, #c6f6d5)";
                burnoutVal.style.color = "#38a169";
                stressVal.innerHTML = `<i data-lucide="check-circle"></i> Low Stress`;
                stressVal.style.background = "rgba(56, 161, 105, 0.1)";
                stressVal.style.color = "#38a169";
            }
            lucide.createIcons();

            // Recommendations
            const list = document.getElementById('recommendationList');
            list.innerHTML = "";
            result.recommendations.forEach(r => {
                const li = document.createElement('li');
                li.innerHTML = r; // Assuming plain text, HTML safe
                list.appendChild(li);
            });

            if (isWhatIf) {
                const li = document.createElement('li');
                li.textContent = "✨ What-If scenario applied: By sleeping 8 hours and limiting screen time, you achieved optimal scores.";
                list.prepend(li);
            }

        } catch (error) {
            alert('Failed to connect to the Flask API. Make sure app.py is running on port 5000!');
            console.error(error);
            document.getElementById('scanningState').classList.add('hidden');
        } finally {
            if (!isWhatIf) predictBtn.classList.remove('loading');
            else whatIfBtn.innerText = "Optimize Habits";
        }
    }

    predictBtn.addEventListener('click', (e) => {
        e.preventDefault();
        makePrediction(false);
    });

    whatIfBtn.addEventListener('click', (e) => {
        e.preventDefault();
        makePrediction(true);
    });
});
