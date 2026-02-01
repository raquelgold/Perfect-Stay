
  # Property Recommendation Website

  This is a code bundle for Property Recommendation Website. The original project is available at https://www.figma.com/design/CgRotPnT1PKiwVxJyHw8zv/Property-Recommendation-Website.

  ## Setup Instructions

  ### Prerequisites
  - Node.js and npm installed
  - Python 3.x installed
  - Flask and required Python packages installed

  ### Running the Application

  **You need to run both the backend and frontend servers:**

  1. **Start the Backend (Flask Server)**
     ```bash
     cd ../backend
     python server.py
     ```
     The backend will run on `http://localhost:5000`

  2. **Start the Frontend (React/Vite)**
     ```bash
     npm i  # Install dependencies (first time only)
     npm run dev
     ```
     The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

  ### How to Use

  1. Open the frontend in your browser (usually `http://localhost:5173`)
  2. Enter a location (e.g., "London", "Miami", "Paris")
  3. Select a vacation goal (Nightlife, Nature, Tourist Attractions, Shopping, or Wellness)
  4. Click the "Search" button
  5. The top 5 properties matching your criteria will be displayed

  ### Backend API

  The frontend communicates with the Flask backend at `http://localhost:5000/recommend`:
  - **Endpoint**: `POST /recommend`
  - **Request Body**: `{ "location": "London", "goal": "Nightlife" }`
  - **Response**: Array of property objects from the CSV
  