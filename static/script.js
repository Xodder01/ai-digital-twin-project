// Update labels when sliders change
const updateVal = (id) => {
    document.getElementById(id + 'Val').innerText = document.getElementById(id).value;
}

document.getElementById('sleep').addEventListener('input', () => updateVal('sleep'));
document.getElementById('study').addEventListener('input', () => updateVal('study'));
document.getElementById('screen').addEventListener('input', () => updateVal('screen'));
document.getElementById('stress').addEventListener('input', () => updateVal('stress'));

async function runSimulation() {
    const btn = document.querySelector('.run-btn');
    btn.innerText = "Simulating...";
    btn.style.opacity = '0.7';

    // Collect values from the sliders
    const payload = {
        sleep_hours: parseFloat(document.getElementById('sleep').value),
        study_hours: parseFloat(document.getElementById('study').value),
        screen_time_hours: parseFloat(document.getElementById('screen').value),
        stress_level: parseFloat(document.getElementById('stress').value)
    };

    try {
        const response = await fetch('/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            alert('Error running simulation: ' + data.error);
            return;
        }

        // Update Productivity
        const prod = document.getElementById('prodOutput');
        prod.innerText = data.new_productivity_score;
        prod.className = 'metric-value'; // reset
        if (data.new_productivity_score > 70) prod.classList.add('value-good');
        else if (data.new_productivity_score > 40) prod.classList.add('value-warning');
        else prod.classList.add('value-danger');

        // Update Burnout Risk
        const fail = document.getElementById('burnoutOutput');
        if (data.new_burnout_risk === 1) {
            fail.innerText = "HIGH";
            fail.className = 'metric-value value-danger';
            fail.style.fontSize = '2rem';
        } else {
            fail.innerText = "LOW";
            fail.className = 'metric-value value-good';
            fail.style.fontSize = '2rem';
        }

        // Update Goal Probability
        const goalOutput = document.getElementById('goalOutput');
        goalOutput.innerText = data.goal_probability + "%";
        goalOutput.className = 'metric-value';
        if (data.goal_probability > 75) goalOutput.classList.add('value-good');
        else if (data.goal_probability > 40) goalOutput.classList.add('value-warning');
        else goalOutput.classList.add('value-danger');

        // Update Exam Score 
        const examObj = document.getElementById('examScore');
        if (examObj && data.exam_score !== undefined) {
            examObj.innerText = data.exam_score + "%";
            examObj.className = 'metric-value';
            if (data.exam_score >= 70) examObj.classList.add('value-good');
            else if (data.exam_score >= 50) examObj.classList.add('value-warning');
            else examObj.classList.add('value-danger');
        }

        // Update Focus Index
        const focusObj = document.getElementById('focusIndex');
        if (focusObj && data.focus_index !== undefined) {
            focusObj.innerText = data.focus_index + "/10";
            focusObj.className = 'metric-value';
            if (data.focus_index >= 7) focusObj.classList.add('value-good');
            else if (data.focus_index >= 4) focusObj.classList.add('value-warning');
            else focusObj.classList.add('value-danger');
        }

        // Update GenAI feedback
        document.getElementById('aiAdviceContainer').style.display = 'block';
        document.getElementById('aiAdviceBox').innerText = data.ai_advice || "No advice returned.";

        // Render Trend Chart
        renderChart(data.weekly_trend);

        // Render Habit Impact Analysis
        renderImpact(data.habit_impact);

    } catch (e) {
        let msg = e.message;
        if (msg.includes("429") || msg.includes("Quota") || msg.includes("limit")) {
            document.getElementById('aiAdviceContainer').style.display = 'block';
            const aiBox = document.getElementById('aiAdviceBox');
            aiBox.innerHTML = "<span style='color:#ff5252;'>⚠️ Simulation Rate Limit Exceeded.</span> Google Free Tier needs 10 seconds to cool down.";
        } else {
            console.error(e);
            alert("Failed to connect to the backend server. Make sure it is running.");
        }
    } finally {
        btn.innerText = 'Run "What-If" Simulation';
        btn.style.opacity = '1';
    }
}

let twinChart = null;

function renderChart(trendArray) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (twinChart) {
        twinChart.destroy();
    }
    
    twinChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Predicted Productivity Trend',
                data: trendArray,
                borderColor: '#00e5ff',
                backgroundColor: 'rgba(0, 229, 255, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: '#bd00ff',
                pointBorderColor: '#fff',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            },
            plugins: {
                legend: { labels: { color: '#ffffff' } }
            }
        }
    });
}

function renderImpact(impactData) {
    const container = document.getElementById('impactList');
    container.innerHTML = '';
    
    for (const [habit, val] of Object.entries(impactData)) {
        const row = document.createElement('div');
        const isPositive = val >= 0;
        
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.padding = '8px 12px';
        row.style.background = 'rgba(255,255,255,0.05)';
        row.style.borderRadius = '8px';
        row.style.borderLeft = isPositive ? '4px solid #00ff88' : '4px solid #ff3366';
        
        row.innerHTML = `
            <span style="font-weight: 500;">${habit}</span>
            <span style="color: ${isPositive ? '#00ff88' : '#ff3366'}; font-weight: bold;">
                ${isPositive ? '+' : ''}${val}% Impact
            </span>
        `;
        container.appendChild(row);
    }
}

