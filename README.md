## Setup Instructions

### 1. Backend (Django)

#### Prerequisites

- Python 3.10+
- `pip`, `virtualenv`

#### Installation

```bash
cd r-review-backend
python -m venv env
source env/bin/activate
```
##### Environment Variables

Create a .env file in the root of r-review-backend/:

```bash
OPENAI_API_KEY=your_openai_api_key
```
#### Run the Backend

```bash
python manage.py migrate
python manage.py runserver
```
The backend will start at: http://localhost:8000/

### 2. Frontend (React)

#### Prerequisites

- Node.js (v18+ recommended)
- `npm`or `yarn`
  
#### Installation

```bash
cd frontend
npm install
```
#### Run the Frontend

```bash
npm start
```
The frontend will start at: http://localhost:3000/

### Architecture Overview

User
 └─> Scans QR Code
     └─> Voice/Text Review
         └─> AI Transcription & Analysis
             ├─> Save to DB
             └─> Record to Hedera (HCS)



## References

1.https://www.tripadvisor.com/ShowTopic-g1-i12105-k14549362-Reviews_Keep_Getting_Deleted-Tripadvisor_Support.html

2.https://www.insidehook.com/travel/tripadvisor-deleting-negative-reviews

3.https://onemileatatime.com/news/tripadvisor-deleting-negative-reviews/

4.The Guardian, “Concerned about your data use?” 31 Oct 2024


