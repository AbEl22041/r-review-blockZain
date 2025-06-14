# R-Review (IReview)

## Context

People's choices are increasingly guided by company reviews. The credibility and transparency of these reviews are crucial. However, current review systems face key issues:

## The Problem

- **Regulators & platforms are cracking down on fake reviews**, eroding trust and revenues. [1][2][3]  
- **Digital sobriety is rising** — every unnecessary kilobyte is scrutinized. Even a single day of messaging has measurable carbon impact. [4]

## Our Solution

| What we fix             | How we fix it                                                                 |
|-------------------------|-------------------------------------------------------------------------------|
| Fake or off-site reviews| Daily rotating QR code + server-side hash check → “Verified on-site” badge   |
| Oversized media traffic | Whisper + mini-LM extract *sentiment (–5…+5)* & keywords → 99.8% smaller payload |
| Tampering & data rot    | Immutable timestamp on Hedera Consensus Service ($0.0001/tx, carbon-negative) |

> _“Scan → Talk → Publish … diners spend < 20s; the restaurant earns durable, trustworthy feedback.”_

---

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


