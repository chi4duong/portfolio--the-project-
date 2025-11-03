# Project Deliverable #2 — Portfolio Update with Yatzy Game  
**Course:** CST3106 – Web Programming 


---

##  1. Project Overview

The **Yatzy Game** is a browser-based dice game implemented with **HTML**, **CSS**, and **modern JavaScript (ES Modules)**.  
Originally developed in **Assignments #1 and #2**, the project was enhanced in **Lab 07** to adopt a **client–server architecture** using **Node.js** and **Express.js**.  

Players roll five dice up to three times per turn, optionally holding dice between rolls, and select scoring categories such as *Full House*, *Small Straight*, or *Yatzy*.  
Each category can be scored only once, and the game ends after all 13 categories are completed.  

This deliverable updates my **student portfolio** to include a complete technical summary of the Yatzy project, document the technologies used, and integrate the visual design system from **Project Deliverable #1**.

---

##  2. Objectives

- **Yatzy Game Summary:** Summarize the game created in Assignments #1 & #2.  
- **Technical Documentation:** Describe the game’s components, logic, and architecture.  
- **Portfolio Design System:** Re-use and document the established color, font, and UI standards.  
- **Integration of Other Technologies:** Showcase broader concepts learned during the course.  

---

##  3. Technical Documentation

###  Server (Backend) — **CommonJS (matches project files)**

**File:** `server/server.js`

```js
// Simple Express server that serves the client and exposes /roll-dices
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from ../client
const clientDir = path.join(__dirname, "..", "client");
app.use(express.static(clientDir));

// GET /roll-dices
app.get("/roll-dices", (req, res) => {
  const count = Math.max(1, Math.min(20, parseInt(req.query.count, 10) || 5));
  const values = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));

  // Log every request in the terminal
  console.log(`Dice roll requested — Count: ${count} | Values: [${values.join(", ")}]`);

  res.json({ values, count, timestamp: new Date().toISOString() });
});

// For direct navigations in SPA-style, fall back to index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Yatzy Lab7 server running at http://localhost:${PORT}`);
  console.log(`Open that URL and click "Roll Dice" to fetch /roll-dices`);
});
```

**Server Summary**
- Generates random dice values and returns them as JSON.  
- Handles GET requests to `/roll-dices`.  
- Serves static HTML, CSS, and JS files for the client.  
- Logs each dice roll to the terminal for verification.  

>  The CommonJS version above matches the current project files.

---

###  Client (Frontend)

**File:** `app.js`

```js
// Fetch random dice values from the server
async function fetchServerRoll(count = 5) {
  const res = await fetch(`/roll-dices?count=${encodeURIComponent(count)}`, {
    headers: { "Accept": "application/json" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.values)) throw new Error("Invalid /roll-dices payload");
  return data.values.slice(0, count);
}

// Roll Dice — triggered by button click (with graceful fallback)
rollBtn?.addEventListener("click", async () => {
  if (game.dice.rollsThisTurn >= game.rollsPerTurn) {
    updateStatus("Roll limit reached. Select a category to score.");
    updateRollButtonState();
    return;
  }

  rollBtn.disabled = true;
  rollBtn.setAttribute("aria-disabled", "true");

  try {
    const serverValues = await fetchServerRoll(5);
    const dice = game.dice.dice;
    for (let i = 0; i < dice.length; i++) {
      if (!dice[i].held) {
        const val = Number.isFinite(serverValues[i])
          ? serverValues[i]
          : 1 + Math.floor(Math.random() * 6);
        dice[i].setValue(val);
      }
    }
    game.dice.rollsThisTurn++;
  } catch (err) {
    console.error("Server roll failed, using local RNG:", err);
    game.roll(); // fallback
  } finally {
    refreshDice();
    updateRollButtonState();
    const atLimit = game.dice.rollsThisTurn >= game.rollsPerTurn;
    updateStatus(atLimit ? "Select a category to score." : "Click dice to hold and roll again.");
    if (!atLimit) {
      rollBtn.disabled = false;
      rollBtn.removeAttribute("aria-disabled");
    }
  }
});
```

**Client Summary**
- Fetches dice values from the server using `fetch()` and `async/await`.  
- Updates the UI dynamically based on the JSON response.  
- Maintains “Held” dice states between rolls.  
- Falls back to local RNG if the server is offline.  

---

##  4. Design System (from PD1)

| **Role** | **Variable** | **Hex** | **Description** |
|-----------|--------------|---------|-----------------|
| Primary | `--color-primary` | #1E3A8A | Deep blue — titles & buttons |
| Secondary | `--color-secondary` | #F59E0B | Gold — “Held” dice & highlights |
| Accent | `--color-accent` | #10B981 | Green — confirm & score actions |
| Background | `--color-bg` | #F8FAFC | Neutral light background |
| Surface | `--color-surface` | #FFFFFF | Card & panel backgrounds |
| Text | `--color-text` | #111827 | Dark, readable text |
| Muted | `--color-muted` | #6B7280 | Hints and labels |

**Fonts**
- **Headings:** *Poppins 700* — bold and geometric.  
- **Body:** *Inter 400–600* — clean and modern.  

**Rationale:** The deep blue, gold, and green palette creates a balanced visual hierarchy and a professional look consistent across the portfolio.

---

##  5. Accessibility & Best Practices Proof (HTML/CSS)

To satisfy the **HTML/CSS best practices** rubric items explicitly, the project includes semantic structure, keyboard operability, ARIA, and responsive design.

**Semantic HTML (Scorecard)**
```html
<section class="scorecard" aria-labelledby="scorecard-title">
  <div class="scorecard__header">
    <h2 id="scorecard-title" class="scorecard__title">Scorecard</h2>
  </div>
  <table aria-describedby="scorecard-desc">
    <caption id="scorecard-desc" class="visually-hidden">Yatzy score categories and points.</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Description</th>
        <th scope="col" class="pts">Points</th>
      </tr>
    </thead>
    <tbody>…</tbody>
  </table>
</section>
```

**Keyboard-Operable Dice (JS enhancement)**
```js
diceEls.forEach((el, i) => {
  el.setAttribute("role", "button");
  el.removeAttribute("aria-disabled");
  el.tabIndex = 0; // focusable

  const toggle = () => {
    const d = game.dice.dice[i];
    d.toggleHold();
    refreshDice();
    updateStatus();
  };

  el.addEventListener("click", toggle);
  el.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  });
});
```

**CSS: Design Tokens & Used State (no inline styles)**
```css
:root{
  --color-primary:#1E3A8A; --color-secondary:#F59E0B; --color-accent:#10B981;
  --color-bg:#F8FAFC; --color-surface:#FFFFFF; --color-text:#111827; --color-muted:#6B7280;
  --radius:16px; --shadow:0 10px 20px rgba(17,24,39,0.08), 0 2px 6px rgba(17,24,39,0.06);
}

/* Score rows marked as used */
.scorecard tr.used {
  opacity: .7;
  pointer-events: none;
  cursor: default;
}

/* Responsive dice tray */
.dice-tray { display:grid; grid-template-columns: repeat(5, 96px); gap:14px; }
@media (max-width: 980px){ .dice-tray { grid-template-columns: repeat(3, 96px); } }
@media (max-width: 600px){ .dice-tray { grid-template-columns: repeat(2, 88px); } }
```

---

##  6. How to Run the Game Locally

### Step 1 — Start the Server
```bash
cd server
npm install
npm start
```
✅ **Expected Output**
```
Yatzy Lab7 server running at http://localhost:3000
Open that URL and click "Roll Dice" to fetch /roll-dices
```

### Step 2 — Open the Client
Open your browser and navigate to:  
```
http://localhost:3000
```
Click  **Roll Dice** to start playing.

### Step 3 — Verify Client–Server Sync
If the connection works, the terminal shows:  
```
Dice roll requested — Count: 5 | Values: [3, 2, 6, 1, 4]
```
This confirms successful server communication.  

---

##  7. Integration of Other Learned Technologies

| **Category** | **Technology / Concept** | **Description** |
|---------------|---------------------------|-----------------|
| Core Web | HTML / CSS / JS Modules | Structured components with responsive layouts |
| Asynchronous JS | `async/await` + `fetch()` | Handled non-blocking API calls |
| REST API | Express endpoint `/roll-dices` | Implemented RESTful communication |
| Accessibility | WCAG + ARIA roles | Improved keyboard navigation & status updates |
| Version Control | Git & GitHub | Used branches and commits for tracking |
| Responsive Design | CSS Grid + Flexbox | Optimized for desktop and mobile |
| Dev Tools | VS Code, Live Server | Enhanced coding workflow |

---

##  8. Highlights & Challenges

- **Client–Server Migration:** Moved dice logic to Express backend.  
- **Asynchronous Handling:** Implemented graceful latency control.  
- **Accessibility:** Ensured ARIA labels and keyboard support for dice.  
- **Responsive Design:** Adapted for multiple screen sizes.  
- **Debugging:** Used console logs and server feedback for validation.  

---


##  9. Conclusion

**Project Deliverable #2** demonstrates a successful migration of the Yatzy Dice Module to a client–server architecture.  
It showcases my ability to develop **full-stack JavaScript applications** with **Node.js**, **Express.js**, and **asynchronous APIs**, while maintaining an accessible and consistent design system throughout the portfolio.
