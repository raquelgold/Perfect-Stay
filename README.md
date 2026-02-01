# Perfect Stay

Perfect Stay is a travel accommodation finder that aggregates property listings from Airbnb and Booking.com. It helps users find properties closer to their vacation goals—whether it's nightlife, nature, shopping, or attending a specific FIFA World Cup 2026 match.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
*   **Python 3.8+**
*   **Node.js 16+** & **npm**
*   **Git**

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/raquelgold/Perfect-Stay.git
cd Perfect-Stay
```

### 2. Data Setup (Crucial)

The property and match data files are **not** included in this repository and must be downloaded separately from the project's Azure Blob Storage.

1.  Create a folder named `data` inside the `backend` directory:
    ```
    backend/data/
    ```
2.  Download the following CSV files from your Azure Blob source and place them into `backend/data/`:
    *   `airbnb_demo_data.csv`
    *   `booking_demo_data.csv`
    *   `download_demo_data.csv` (Contains World Cup Matches)
    *   `airbnb_worldcup_demo_data.csv`
    *   `booking_worldcup_demo_data.csv`

**Your file structure should look like this:**
```
Perfect-Stay/
├── backend/
│   ├── data/
│   │   ├── airbnb_demo_data.csv
│   │   ├── booking_demo_data.csv
│   │   ├── download_demo_data.csv
│   │   ├── airbnb_worldcup_demo_data.csv
│   │   └── booking_worldcup_demo_data.csv
│   ├── server.py
│   └── requirements.txt
├── lab-final/ (Frontend)
└── ...
```

### 3. Backend Setup

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
```

**Create and activate a virtual environment (recommended):**

*   **Windows:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
*   **macOS/Linux:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Start the Flask Server:**

```bash
python server.py
```

You should see output indicating the server is running on `http://127.0.0.1:5000` and the data CSVs have been loaded successfully.

### 4. Frontend Setup

Open a **new** terminal window (keep the backend running) and navigate to the frontend folder `lab-final`:

```bash
cd lab-final
```

**Install dependencies:**

```bash
npm install
```

**Start the Development Server:**

```bash
npm run dev
```

The terminal will show a local URL (usually `http://localhost:5173`). Open this link in your browser to view the application.

---

## 🎮 Usage

### General Search
1.  Enter a city (e.g., "Paris", "Miami").
2.  Select a vacation goal (e.g., "Nightlife", "Nature").
3.  Click **Search** to see the top properties from Airbnb and Booking.com.

### FIFA World Cup 2026 Mode 🏆
1.  Click the simplified **FIFA World Cup 2026** banner.
2.  A list of matches will appear in a modal. Select a match (e.g., "Mexico vs. USA").
3.  The application will automatically find the properties closest to the stadium for that specific match.

---

## 🛠️ Configuration

*   **API Keys**: The application uses Geoapify for coordinates. If you need to change the API key, verify `GEOAPIFY_KEY` in `backend/server.py`.
*   **Backend URL**: The frontend expects the backend to be at `http://127.0.0.1:5000`. This is configured in `lab-final/src/app/api.ts`.