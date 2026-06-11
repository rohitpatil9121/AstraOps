# AstraOps

![Status](https://img.shields.io/badge/status-active-22c55e?style=for-the-badge)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-38bdf8?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-14b8a6?style=for-the-badge)
![AWS](https://img.shields.io/badge/cloud-AWS-f59e0b?style=for-the-badge)

AstraOps is a cloud observability platform built for **AWS infrastructure monitoring**, **operational intelligence**, and **security visibility**.  
It brings together EC2 inventory, CloudWatch metrics, alerts, insights, and a clean enterprise-style dashboard.

## What AstraOps Does

- Monitors AWS EC2 instances in real time
- Pulls **CloudWatch CPU metrics** directly from AWS
- Supports **memory monitoring** through CloudWatch Agent
- Generates **operational insights** from live infrastructure signals
- Detects **alerts** and risk conditions
- Displays a **security overview** with IAM and AWS health context
- Uses **Supabase Auth** for secure login and user sessions

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

**Backend**
- FastAPI
- boto3
- SQLAlchemy
- WebSockets

**Cloud & Auth**
- AWS EC2
- AWS CloudWatch
- CloudWatch Agent
- IAM
- Supabase Auth

## Screenshots

Add your project screenshots here:

- Login page
- Dashboard
- AWS Infrastructure
- Security Center

## Core Features

### Dashboard
- CPU Utilization
- Memory Utilization
- EC2 Instance Count
- Active Alerts
- Health Score
- Operational Insights

### AWS Monitoring
- EC2 inventory from AWS
- CloudWatch CPU metrics
- CloudWatch memory metrics
- Historical CPU/memory trends

### Security
- Security score overview
- AWS connection status
- IAM security summary
- Infrastructure recommendations

### Realtime Updates
- WebSocket-powered live updates
- Live dashboard refresh
- Infrastructure signal stream

## Project Structure

```text
AstraOps/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── supabase.js
└── backend/
    └── app/
        ├── main.py
        ├── aws_service.py
        ├── supabase_auth.py
        ├── supabase_client.py
        ├── docker_service.py
        └── k8s_service.py
```

## Quick Start

### 1) Clone the repository

```bash
git clone https://github.com/rohitpatil9121/AstraOps.git
cd AstraOps
```

### 2) Backend setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 3) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Frontend `.env`

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend `.env`

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url
```

## AWS Permissions Needed

For the AWS account/user connected to AstraOps, the following permissions are recommended:

- `AmazonEC2ReadOnlyAccess`
- `CloudWatchReadOnlyAccess`
- `IAMReadOnlyAccess` (for IAM summary features)

For memory metrics, install and configure the **CloudWatch Agent** on the EC2 instance.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/aws-status` | Check whether AWS is connected |
| POST | `/connect-aws` | Save AWS credentials |
| GET | `/user-ec2` | Return EC2 inventory |
| GET | `/aws-metrics` | Return CloudWatch summary metrics |
| GET | `/aws-metrics-history` | Return historical CPU and memory data |
| GET | `/security-summary` | Return security overview |
| WS | `/ws/metrics` | Realtime dashboard stream |

## How It Works

1. User signs in with Supabase.
2. User connects AWS access key, secret key, and region.
3. Backend fetches EC2 and CloudWatch data using boto3.
4. Dashboard shows metrics, alerts, insights, and trends.
5. CloudWatch Agent publishes memory metrics for richer observability.

## Future Improvements

- Cost analytics
- Security score automation
- IAM users table
- Trend statistics cards
- More detailed AWS architecture views

## License

This project is created for learning, portfolio, and demonstration purposes.

## Author

**Rohit Patil**
