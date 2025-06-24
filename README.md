# 💳 Aurora Bank – Online Banking Application

Aurora Bank is a full-stack online banking application built using **React (Vite)** for the frontend and **Node.js + Express** for the backend. The project uses **MySQL** as the database.

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed:

- ✅ [Node.js](https://nodejs.org/) (Install from Google or the official website)
- ✅ MySQL (Install and configure on your system)

---

## 📁 Project Setup

### 1. Create Project Directory

```bash
mkdir aurora-bank
cd aurora-bank
cd client          # go to frontend folder
npm install        # install dependencies
npm run dev        # start frontend dev server
cd ../server       # go to backend folder
npm install        # install backend packages
node server.js     # start backend server


Import the init.sql file found in the server folder.
It creates the database, tables, and includes a default user for login.
You can either:
Use the name, email, and password provided in init.sql to log in.


