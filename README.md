# AstraOps 🚀

AstraOps is a cloud observability and infrastructure monitoring platform built to provide real-time visibility into cloud resources, containers, and Kubernetes workloads. The platform integrates AWS services, Docker, Kubernetes, and AI-powered infrastructure insights through a modern dashboard experience.

## Features

### Authentication & User Management

* Secure user authentication using Supabase
* JWT-based authorization
* User-specific AWS credential management
* Protected routes and session handling

### AWS Infrastructure Monitoring

* Connect personal AWS accounts securely
* View EC2 instance inventory
* Display instance metadata:

  * Instance ID
  * Instance Name
  * Instance Type
  * State
  * Public IP
* User-specific AWS resource visibility

### Real-Time Monitoring

* WebSocket-based live metrics
* CPU utilization tracking
* Memory utilization tracking
* Container monitoring
* Infrastructure health monitoring

### Kubernetes Monitoring

* Kubernetes pod discovery
* Pod status tracking
* Namespace visibility
* Restart count monitoring

### Docker Monitoring

* Running container visibility
* Container statistics collection
* Real-time container metrics

### AI Infrastructure Insights

* Infrastructure health analysis
* Alert severity assessment
* Scaling recommendations
* Operational insights generation

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Recharts

### Backend

* FastAPI
* SQLAlchemy
* WebSockets
* Boto3
* SQLite

### Cloud & DevOps

* AWS EC2
* AWS CloudWatch
* Docker
* Kubernetes

### Authentication

* Supabase Authentication

---

## Architecture

```text
Frontend (React + Vite)
        │
        ▼
FastAPI Backend
        │
 ┌──────┼─────────┐
 ▼      ▼         ▼
AWS   Docker   Kubernetes
 │
 ▼
CloudWatch Metrics
```

## Project Structure

```text
astraopsss/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── aws_service.py
│   │   ├── docker_service.py
│   │   ├── k8s_service.py
│   │   ├── models.py
│   │   └── supabase_auth.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── supabase.js
│   │   └── main.jsx
│   │
│   └── package.json
│
└── docker-compose.yml
```

## Installation

### Clone Repository

```bash
git clone https://github.com/rohitpatil9121/AstraOps.git
cd AstraOps
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Frontend (.env)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Current Capabilities

* User Authentication
* AWS Account Integration
* EC2 Instance Monitoring
* Real-Time Infrastructure Metrics
* Kubernetes Pod Monitoring
* Docker Monitoring
* AI-Powered Insights Dashboard

---

## Future Enhancements

* CloudWatch Metrics Integration
* Memory Utilization Monitoring
* Multi-Cloud Support
* Cost Monitoring Dashboard
* Alerting & Notifications
* Infrastructure Reports
* Role-Based Access Control
* AI Incident Analysis

---

## Author

**Rohit Patil**

Cloud Computing & DevOps Enthusiast

GitHub: https://github.com/rohitpatil9121

---

## License

This project is developed for educational, learning, and portfolio purposes.
