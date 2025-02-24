// Your workout plan
const workoutPlan = {
    day1: [
        { name: "Weighted Pull-Ups", reps: "4x6-8" },
        { name: "Ring Pull-Ups", reps: "3x8-12" },
        { name: "Dumbbell Bent-Over Rows", reps: "4x8-12" },
        { name: "Bicep Curls (Dumbbells/Rings)", reps: "3x10-12" },
        { name: "Face Pulls (Rings/Bands)", reps: "3x12-15" }
    ],
    day2: [
        { name: "Goblet Squats (Heavy Kettlebell)", reps: "4x10-12" },
        { name: "Romanian Deadlifts (Dumbbells)", reps: "4x8-12" },
        { name: "Step-Ups (Weighted if possible)", reps: "3x10-12 per leg" },
        { name: "Hanging Knee Raises (or Rings)", reps: "3x12-15" },
        { name: "Side Plank Holds", reps: "3x30 sec per side" }
    ],
    day3: [
        { name: "Weighted Dips", reps: "4x6-8" },
        { name: "Ring Dips", reps: "3x10-12" },
        { name: "Dumbbell Overhead Press", reps: "4x8-12" },
        { name: "Lateral Raises (Dumbbells)", reps: "3x12-15" },
        { name: "Triceps Extensions (Rings/Dumbbells)", reps: "3x12-15" }
    ],
    day4: [
        { name: "Bulgarian Split Squats (Dumbbells)", reps: "4x10 per leg" },
        { name: "Kettlebell Swings", reps: "4x15-20" },
        { name: "Dumbbell Step-Ups", reps: "3x10 per leg" },
        { name: "Glute Bridges (Weighted if possible)", reps: "3x12-15" },
        { name: "Hanging Leg Raises", reps: "3x12-15" }
    ],
    day5: [
        { name: "Pull-Ups (or Ring Pull-Ups)", reps: "3x10" },
        { name: "Push-Ups (Weighted if possible)", reps: "3x15" },
        { name: "Kettlebell Swings", reps: "3x15" },
        { name: "Lunges (Weighted)", reps: "3x12 per leg" },
        { name: "Core (Hanging Raises or Planks)", reps: "3x12-15" }
    ]
};

// Load a day's exercises
function loadDay(day) {
    const exerciseList = document.getElementById("exercise-list");
    const progressMenu = document.getElementById("progress-menu");
    exerciseList.style.display = "block";
    progressMenu.style.display = "none";
    
    exerciseList.innerHTML = "";
    let savedData = JSON.parse(localStorage.getItem(day)) || workoutPlan[day];

    savedData.forEach((exercise, index) => {
        const div = document.createElement("div");
        div.className = "exercise";
        div.innerHTML = `
            <h3>${exercise.name} (${exercise.reps})</h3>
            <input type="number" id="sets-${index}" placeholder="Sets done">
            <input type="text" id="reps-${index}" placeholder="Reps/Time done">
            <input type="number" id="weight-${index}" placeholder="Weight (KG)">
            <button onclick="saveProgress('${day}', ${index})">Save</button>
            <div class="history" id="history-${index}">${showHistory(exercise.history)}</div>
        `;
        exerciseList.appendChild(div);
    });
}

// Save progress for an exercise
function saveProgress(day, index) {
    let savedData = JSON.parse(localStorage.getItem(day)) || workoutPlan[day];
    const setsDone = document.getElementById(`sets-${index}`).value.trim();
    const repsDone = document.getElementById(`reps-${index}`).value.trim();
    const weight = document.getElementById(`weight-${index}`).value.trim();

    if (setsDone === "" || repsDone === "" || setsDone === undefined || repsDone === undefined) {
        return;
    }

    if (!savedData[index].history) savedData[index].history = [];
    
    const entry = {
        date: new Date().toLocaleDateString(),
        sets: setsDone,
        reps: repsDone,
        weight: weight || "0"
    };
    savedData[index].history.push(entry);
    localStorage.setItem(day, JSON.stringify(savedData));
    document.getElementById(`history-${index}`).innerHTML = showHistory(savedData[index].history);
}

// Display history below exercises
function showHistory(history) {
    if (!history || history.length === 0) return "No history yet.";
    const validHistory = history.filter(entry => 
        entry && 
        entry.date && 
        entry.sets !== undefined && 
        entry.reps !== undefined && 
        entry.weight !== undefined
    );
    if (validHistory.length === 0) return "No history yet.";
    return validHistory.map(entry => `<p>${entry.date}: ${entry.sets} sets, ${entry.reps}, ${entry.weight} KG</p>`).join("");
}

// Show progress menu
function showProgressMenu() {
    const exerciseList = document.getElementById("exercise-list");
    const progressMenu = document.getElementById("progress-menu");
    exerciseList.style.display = "none";
    progressMenu.style.display = "block";
    
    progressMenu.innerHTML = `
        <h2>Progress</h2>
        <select id="progress-day-filter" onchange="filterProgress(this.value)">
            <option value="all">All Days</option>
            <option value="day1">Day 1</option>
            <option value="day2">Day 2</option>
            <option value="day3">Day 3</option>
            <option value="day4">Day 4</option>
            <option value="day5">Day 5</option>
        </select>
        <div id="progress-buttons">
            <button class="toggle-btn" onclick="toggleView('table')">Show Table</button>
            <button class="toggle-btn" onclick="toggleView('graph')">Show Graph</button>
            <button class="back-btn" onclick="loadDay(document.getElementById('day-select').value)">Back</button>
        </div>
        <div id="progress-content"></div>
    `;
    filterProgress("all");
}

// Filter progress by day
function filterProgress(dayFilter) {
    const content = document.getElementById("progress-content");
    content.innerHTML = "";
    
    let daysToShow = dayFilter === "all" ? Object.keys(workoutPlan) : [dayFilter];
    
    daysToShow.forEach(day => {
        const savedData = JSON.parse(localStorage.getItem(day)) || workoutPlan[day];
        savedData.forEach(exercise => {
            const div = document.createElement("div");
            div.innerHTML = `
                <h3>${day.toUpperCase()} - ${exercise.name}</h3>
                <p>Target: ${exercise.reps}</p>
                <div id="table-${day}-${exercise.name.replace(/\s+/g, "-")}" class="progress-table"></div>
                <canvas id="graph-${day}-${exercise.name.replace(/\s+/g, "-")}" width="350" height="200" class="progress-graph" style="display: none;"></canvas>
            `;
            content.appendChild(div);
            if (exercise.history) {
                updateTable(exercise.history, `table-${day}-${exercise.name.replace(/\s+/g, "-")}`);
                drawGraph(exercise.history, `graph-${day}-${exercise.name.replace(/\s+/g, "-")}`);
            }
        });
    });
}

// Update history table
function updateTable(history, tableId) {
    const tableDiv = document.getElementById(tableId);
    const validHistory = history ? history.filter(entry => 
        entry && 
        entry.date && 
        entry.sets !== undefined && 
        entry.reps !== undefined && 
        entry.weight !== undefined
    ) : [];
    if (validHistory.length === 0) {
        tableDiv.innerHTML = "No data yet.";
        return;
    }
    tableDiv.innerHTML = `
        <table>
            <tr><th>Date</th><th>Sets</th><th>Reps/Time</th><th>Weight (KG)</th></tr>
            ${validHistory.map(h => `<tr><td>${h.date}</td><td>${h.sets}</td><td>${h.reps}</td><td>${h.weight}</td></tr>`).join("")}
        </table>
    `;
}

// Draw graph with reps and weight, including Y-axis and X-axis labels
function drawGraph(history, canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const validHistory = history ? history.filter(entry => 
        entry && 
        entry.date && 
        entry.sets !== undefined && 
        entry.reps !== undefined && 
        entry.weight !== undefined
    ) : [];
    if (validHistory.length < 1) return;
    
    // Parse reps to extract numeric value
    const parseReps = (reps) => {
        if (!reps) return 0;
        const match = reps.match(/\d+/); // Extract numbers from string (e.g., "20" from "20")
        return match ? parseFloat(match[0]) : 0;
    };

    const repsData = validHistory.map(h => parseReps(h.reps));
    const weightData = validHistory.map(h => parseFloat(h.weight) || 0);
    const maxReps = Math.max(...repsData);
    const maxWeight = Math.max(...weightData);
    
    // Use separate scales for clarity if ranges differ significantly
    const maxYReps = maxReps || 1;
    const maxYWeight = maxWeight || 1;
    const yMargin = 30; // Increased margin for larger labels
    const graphHeight = canvas.height - yMargin * 2;
    const stepX = validHistory.length > 1 ? (canvas.width - yMargin * 2) / (validHistory.length - 1) : (canvas.width - yMargin * 2); // Adjust for margins

    // Determine max Y for scaling (use larger range for both lines)
    const maxY = Math.max(maxYReps, maxYWeight);
    const stepY = graphHeight / (maxY * 1.2); // Slightly larger scale for clarity

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.moveTo(yMargin, yMargin); // Left Y-axis (reps)
    ctx.lineTo(yMargin, canvas.height - yMargin);
    ctx.moveTo(yMargin, canvas.height - yMargin); // X-axis
    ctx.lineTo(canvas.width - yMargin, canvas.height - yMargin);
    ctx.moveTo(canvas.width - yMargin, yMargin); // Right Y-axis (weight)
    ctx.lineTo(canvas.width - yMargin, canvas.height - yMargin);
    ctx.stroke();

    // Y-axis labels (left for reps, right for weight)
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial"; // Slightly larger font for visibility
    const ySteps = 5; // Number of Y-axis divisions
    for (let i = 0; i <= ySteps; i++) {
        const value = (maxY * i) / ySteps;
        const y = canvas.height - yMargin - (value * stepY);
        ctx.fillText(value.toFixed(0), 5, y + 4); // Left side for reps
        ctx.fillText(value.toFixed(0), canvas.width - yMargin + 5, y + 4); // Right side for weight
    }

    // Reps line (blue, left Y-axis)
    ctx.beginPath();
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 2;
    validHistory.forEach((entry, i) => {
        const x = yMargin + i * stepX;
        const y = canvas.height - yMargin - (parseReps(entry.reps) * stepY);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Weight line (red, right Y-axis)
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    validHistory.forEach((entry, i) => {
        const x = yMargin + i * stepX;
        const y = canvas.height - yMargin - (parseFloat(entry.weight) * stepY);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // X-axis labels (dates)
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial"; // Match Y-axis font size
    validHistory.forEach((entry, i) => {
        const x = yMargin + i * stepX;
        const text = entry.date.split("/").slice(1).join("/"); // Show MM/DD for brevity (e.g., "2/24")
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, x - textWidth / 2, canvas.height - yMargin + 20); // Lower and further out for visibility
    });

    // Legend
    ctx.fillStyle = "#007bff";
    ctx.fillRect(yMargin + 10, 10, 10, 10);
    ctx.fillStyle = "#000";
    ctx.fillText("Reps (Left)", yMargin + 25, 15);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(yMargin + 100, 10, 10, 10);
    ctx.fillStyle = "#000";
    ctx.fillText("Weight (Right)", yMargin + 115, 15);
}

// Toggle between table and graph
function toggleView(view) {
    const tables = document.getElementsByClassName("progress-table");
    const graphs = document.getElementsByClassName("progress-graph");
    for (let i = 0; i < tables.length; i++) {
        tables[i].style.display = view === "table" ? "block" : "none";
        graphs[i].style.display = view === "graph" ? "block" : "none";
    }
}

// Load Day 1 by default
loadDay("day1");