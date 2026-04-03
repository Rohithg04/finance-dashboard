# Nexus Finance Dashboard UI

![Status](https://img.shields.io/badge/status-active-success)
![Made With](https://img.shields.io/badge/Made%20with-JavaScript-yellow)

Welcome to the Nexus Finance Dashboard project! This application is a fully functional frontend interface designed to track financial activity with a premium, enterprise-grade aesthetic.

## 🚀 Overview of Approach

The philosophy behind this build was to deliver a "WOW" factor using purely Vanilla technologies (HTML, CSS, and JS). Rather than relying on heavyweight frameworks, it utilizes modern JavaScript patterns (State Management objects), CSS Variables for full Light/Dark mode switching, and a flexible Grid/Flexbox architecture. 

It fulfills the assignment requirements comprehensively, packing core dashboard elements into a clean, glassmorphic layout adorned with micro-interactions, responsive sidebars, and fluid animations.

## 🌟 Key Features

### 1. Dashboard Overview
- **Summary Cards:** Dynamically calculated Balance, Income, and Expenses, coupled with simulated Month-Over-Month growth indicators.
- **Visualizations:** A line chart for the Balance Trend (simulating progression over time) and a Doughnut chart for visualizing the Spending Breakdown via `Chart.js`.
- **Skeleton Loading:** Realistic startup animations simulating API fetching to demonstrate real-world patterns.

### 2. Transactions & Data Handling
- **Data Table:** A clean list of transactions featuring inline progress bars to visually gauge expense load per category.
- **Advanced Filtering/Sorting:** Real-time text search, classification filtering (Income vs Expense), and multi-criteria sorting (Amount or Date ascending/descending).
- **Data Persistence:** Automatically binds to `localStorage` so your data doesn't disappear on refresh.

### 3. Role-Based Access Control (RBAC)
- **Role Switcher:** Easily switch between Viewer and Admin modes in the sidebar.
- **Viewer:** Dedicated to data visualization only.
- **Admin:** Unlocks the capability to securely Add, Edit, and Delete transactions via an animated, centered Modal overlay.

### 4. AI Insights
- Automatically computes data to reveal the highest spending category as a percentage of total expenses.
- Highlights your single largest transaction for quick review.
- Features a graceful empty state if no data is available.

### 5. Custom Elements (Optional Enhancements Completed)
- **Dark / Light Mode**: Smooth transition engine built entirely on CSS Variables.
- **Custom Toast Notifications**: Professional slide-in alerts replacing standard browser `alert()` popups.
- **Export to CSV**: Easily export your current transaction lists directly into a `.csv` file.
- **Animations**: Staggered card entrances and shimmer loading effects.

---

## 🛠️ Setup Instructions

Because this project is built entirely on vanilla web stack technologies, **there are no complex `npm install` steps or build tools required.**

There are two easy ways to run this:

### Option 1: Direct File Open
Simply double-click the `index.html` file, or drag and drop it into any modern web browser (Edge, Chrome, Firefox, Safari).

### Option 2: Live Server (Recommended)
Running through a local web server ensures that browser extensions and local storage protocols act exactly as they would in production.
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on `index.html` and select **"Open with Live Server"**. 

---

## 💻 Technical Architecture

1. **`index.html`:** The core semantic structure. Utilizes the Bento layout approach to organize UI regions logically.
2. **`style.css`:** Implements an advanced cascading rule set. Uses root variables to orchestrate theme switching globally. Employs CSS `@keyframes` to stagger element presentation for a polished entrance.
3. **`script.js`:** The brain of the App. 
   - Encapsulates state (`transactions`, `role`, `theme`).
   - Uses an IIFE/modular pattern (`init(), updateUI(), renderCharts()`) to prevent global namespace pollution and ensure the DOM reacts perfectly to state changes.
4. **`data.js`:** Provides initial seed data so the dashboard is easily reviewable upon first launch.

---
_Designed with modern UX principles for the Frontend Assignment._
