# Project Deliverable – Portfolio With Full-Stack Applications  
**Course:** CST3106 – Web Programming  

This portfolio update includes two major full-stack projects:

- **Yatzy Dice Game** — a client–server dice game using HTML, CSS, JavaScript, and Node.js  
- **Hospital Triage Management System** — a CRUD + REST application using Node.js, Express, and PostgreSQL  

Both projects follow the design system and accessibility standards established in **Project Deliverable #1**.

---

# 1. Project Overview

## 1.1 Yatzy Game  
The **Yatzy Game** is a browser-based dice game originally built in Assignments #1 and #2.  
In **Lab 07**, the game was enhanced with a **Node.js + Express.js server**, enabling client–server dice rolling using a REST endpoint.

Players roll dice, hold dice between rolls, and choose scoring categories such as *Full House*, *Sm. Straight*, and *Yatzy*.  
The game ends once all 13 categories have been scored.

This deliverable updates the portfolio to document the game, summarize the architecture, and integrate PD1 design system elements.

---

## 1.2 Hospital Triage Management System  
The **Hospital Triage System** simulates an emergency room waiting list.  
It includes:

### Patient Features
- Self-registration (name, symptoms, pain level, notes)
- Status lookup using patient ID
- Estimated wait time calculation

### Admin Features
- View all waiting patients
- Update triage priority
- Mark patients as completed
- View full patient details

### Backend Features
- REST API using Express.js  
- Queue ordering logic  
- Automatic wait time calculation  
- PostgreSQL database with `patients` and `levels` tables  

---

# 2. Objectives

- Summarize and document both full-stack projects  
- Demonstrate server–client communication  
- Apply REST API patterns using Express  
- Showcase PD1 design system across projects  
- Provide accessibility examples using ARIA, semantic HTML, and WCAG-aligned contrast  
- Document learned technologies (async JS, fetch, Node.js, modules, DB integration)

---

# 3. Yatzy Game — Technical Documentation

## 3.1 Server (Backend) — *CommonJS Version*

**File:** `server/server.js`

```js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const clientDir = path.join(__dirname, "..", "client");
app.use(express.static(clientDir));

app.get("/roll-dices", (req, res) => {
  const count = Math.max(1, Math.min(20, parseInt(req.query.count, 10) || 5));
  const values = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));

  console.log(`Dice roll requested — Count: ${count} | Values: [${values.join(", ")}]`);
  res.json({ values, count, timestamp: new Date().toISOString() });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Yatzy server running at http://localhost:${PORT}`);
});
```

### Server Summary  
- Generates random dice values  
- Exposes REST endpoint `/roll-dices`  
- Serves static frontend files  
- Logs all dice rolls for debugging  

---

## 3.2 Client (Frontend)

**File:** `client/app.js`

```js
async function fetchServerRoll(count = 5) {
  const res = await fetch(`/roll-dices?count=${count}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.values.slice(0, count);
}

rollBtn?.addEventListener("click", async () => {
  if (game.dice.rollsThisTurn >= game.rollsPerTurn) return;

  rollBtn.disabled = true;

  try {
    const serverValues = await fetchServerRoll(5);
    const dice = game.dice.dice;

    for (let i = 0; i < dice.length; i++) {
      if (!dice[i].held) dice[i].setValue(serverValues[i]);
    }

    game.dice.rollsThisTurn++;
  } catch (err) {
    console.error("Server failed, using fallback RNG:", err);
    game.roll();
  } finally {
    refreshDice();
    rollBtn.disabled = false;
  }
});
```

### Client Summary  
- Fetches dice results using `fetch()` and `async/await`  
- Updates UI interactively  
- Supports keyboard navigation and ARIA roles  
- Uses PD1 design tokens  

---

# 4. Hospital Triage System — Technical Documentation

# 4.1 Entities Description

## **Patients**
Stores demographic and clinical information, including current triage state.  
Used by both patient-facing and admin-facing UI.

## **Levels**
Represents triage categories (“Level 1”, “Level 2”, “Level 3”).  
Referenced by both `patients` and future extensions such as history auditing.

---

# 4.2 Attributes Specification

## **Table: `patients`**

| Field                | Type        | Constraints                                             | Description |
|----------------------|-------------|---------------------------------------------------------|-------------|
| `id`                 | SERIAL PK   | —                                                       | Unique ID |
| `name`               | TEXT        | NOT NULL                                                | Patient name |
| `age`                | INTEGER     | CHECK (age >= 0)                                        | Age |
| `symptoms`           | TEXT        | NULL                                                    | Patient symptoms |
| `pain_level`         | INTEGER     | CHECK (pain_level BETWEEN 1 AND 10)                     | Pain 1–10 |
| `notes`              | TEXT        | NULL                                                    | Optional notes |
| `triage_level_code`  | SMALLINT    | FK → `levels.triage_level_code`                         | Triage category |
| `status`             | TEXT        | NOT NULL DEFAULT 'waiting'                              | waiting/completed |
| `created_at`         | TIMESTAMPTZ | DEFAULT NOW()                                            | Timestamp |
| `updated_at`         | TIMESTAMPTZ | DEFAULT NOW()                                            | Timestamp |

---

## **Table: `levels`**

| Field | Type | Description |
|--------|--------|-------------|
| `triage_level_code` | SMALLINT PK | Level number |
| `label` | TEXT | “Level 1”, “Level 2”, etc. |

---

# 4.3 Relationships

```
levels (1) ──── (M) patients
```

---

# 4.4 Backend Logic (Express API)

```js
app.post("/api/patients", async (req, res) => {
  const { name, age, symptoms, pain_level, notes } = req.body;

  const triage_level_code = calculateTriageLevel(pain_level);

  const result = await pool.query(
    `INSERT INTO patients
     (name, age, symptoms, pain_level, notes, triage_level_code, status)
     VALUES ($1,$2,$3,$4,$5,$6,'waiting')
     RETURNING *`,
    [name, age, symptoms, pain_level, notes, triage_level_code]
  );

  res.status(201).json(result.rows[0]);
});
```

### Wait Time Calculation

```js
const AVG_SERVICE_MIN = 20;

return result.rows.map((p, index) => ({
  ...p,
  estimated_wait_min: index * AVG_SERVICE_MIN
}));
```

---

# 5. Design System (From PD1)

| Role | Token | Hex |
|------|--------|------|
| Primary | `--color-primary` | #1E3A8A |
| Secondary | `--color-secondary` | #F59E0B |
| Accent | `--color-accent` | #10B981 |
| Background | `--color-bg` | #F8FAFC |
| Surface | `--color-surface` | #FFFFFF |
| Text | `--color-text` | #111827 |
| Muted | `--color-muted` | #6B7280 |

### Fonts  
- **Poppins 700** — Headings  
- **Inter 400–600** — Body text  

### Accessibility  
- Semantic HTML (`<section>`, `<table>`, `<header>`)  
- ARIA labels and roles  
- Keyboard operability  
- WCAG-aligned contrast  

---

# 6. How to Run Each Project

##  Yatzy Game
```bash
cd server
npm install
npm start
```
Open:
```
http://localhost:3000
```

---

## Hospital Triage System
```bash
npm install
node server.js
```
Open:
```
http://localhost:3000/patient_home.html
```

Requires PostgreSQL with the `patients` table.

---

# 7. Technologies Used

| Area | Tools |
|-------|--------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| API | REST (GET, POST, PATCH) |
| Dev Tools | VS Code, Git, GitHub |
| UI | Design System tokens |
| Accessibility | ARIA + WCAG practices |

---

# 8. Highlights & Challenges

### Highlights
- Built two fully functional full-stack applications  
- Implemented REST APIs  
- Designed responsive interfaces with CSS Grid/Flexbox  
- Created and documented SQL schema  
- Re-used unified design system across apps  
- Improved accessibility and keyboard navigation  

### Challenges  
- Synchronizing front-end and server logic  
- Debugging async flows and fetch errors  
- Database design for real-world triage logic  
- Maintaining visual consistency across projects  

---

# 9. Conclusion

This deliverable integrates both the **Yatzy Dice Game** and the **Hospital Triage Management System** into a unified portfolio.  
Together, they demonstrate practical experience in:

- Full-stack JavaScript  
- REST API design  
- Database modeling  
- Interactive UI development  
- Accessibility implementation  
- Professional software documentation  

These projects highlight a strong foundation in modern web development practices.

