# BrainTease Trivia Game

A Trivia‑style trivia web application using a **Django backend**, **React frontend**, and **Cluebase API integration** for real trivia questions.

---

## 📄 Product Documents

Below are the primary documents guiding the product lifecycle:

* (**Project Pitch**)[https://docs.google.com/document/d/1k3iZZRVs12_6fyuzm0hiICZa5F8WuATx7rhdf86mLQI/edit?usp=sharing] 
* (**Product Requirements Document (PRD)**)[https://docs.google.com/document/d/1fcnSMx_7eWq-mUQQB2qD5wGnoQnsBDutAVaRssht6q0/edit?usp=sharing]
* (**Design Doc**)[https://docs.google.com/document/d/1FlPl4JpXsVhxJbMRrglMTTKHnePwyPPbE42TLIXxN54/edit?usp=sharing]
* (**Heuristic Evaluation**)[https://docs.google.com/document/d/16f2XR6zkXOC1dVLtpPA2UEkqOoIpNU5D93eMrZssoCs/edit?usp=sharing]

---

## 📘 Overview

BrainTease is a real‑time trivia platform where players answer interactive questions, track scores, and compete on a global leaderboard. The backend exposes endpoints for:

* Fetching trivia questions
* Submitting player scores
* Retrieving the leaderboard

BrainTease integrates with the **OpenTBD API**, an open-source Trivia dataset, to provide dynamic and authentic questions.

---

## 🏗️ Tech Stack

### **Backend (Django)**

* Django REST Framework
* Cluebase API Integration
* SQLite / PostgreSQL

### **Frontend (React)**

* Game board UI
* Live scoring
* API communication with backend


## 🔌 API Endpoints

### **GET /api/questions/**

Fetches trivia questions from Cluebase or your local DB.

### **POST /api/submit-score/**

Submits a player's score.

### **GET /api/leaderboard/**

Returns the top players.

---

## 🧩 OpenTBD Integration

The application uses a services.py helper inside the questions app to make external requests to OpenTBD.

Example usage:

```python
from .services import fetch_cluebase_question
question = fetch_cluebase_question()
```

---

## 🗄️ Database Models

The **Question** model stores question text, category, difficulty, and answers.

```python
class Question(models.Model):
    text = models.TextField()
    answer = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=20)
    category = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## ▶️ Running the Backend

```
pm install  # (frontend)
pip install -r requirements.txt  # (backend)
python manage.py migrate
python manage.py runserver
```

---

## 🧪 Testing

* Unit tests for API endpoints
* Integration tests for Cluebase API wrapper
* Frontend → backend communication tests

---

## 📜 License

MIT License

---

## ✨ Author

BrainTease — Trivia-style trivia made modern.
