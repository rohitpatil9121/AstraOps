from fastapi import FastAPI, WebSocket, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.websockets import WebSocketDisconnect

from app.database import Base, SessionLocal, engine
from app.models import User
from app.supabase_auth import verify_supabase_token
from app.docker_service import get_running_containers
from app.aws_service import (
    get_user_ec2_instances,
    get_user_ec2_metrics,
)
from app.k8s_service import get_k8s_pods

import asyncio
import random
import psutil


app = FastAPI(title="AstraOps Backend")
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class AWSConnectRequest(BaseModel):
    aws_access_key: str
    aws_secret_key: str
    aws_region: str


@app.get("/")
def root():
    return {"message": "AstraOps Backend Running 🚀"}


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/aws-status")
def aws_status(
    current_user=Depends(verify_supabase_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == current_user.email).first()
    return {
        "aws_connected": bool(
            user and user.aws_access_key and user.aws_secret_key and user.aws_region
        )
    }


@app.post("/connect-aws")
def connect_aws(
    aws: AWSConnectRequest,
    current_user=Depends(verify_supabase_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == current_user.email).first()

    if not user:
        username = (current_user.email or "user").split("@")[0]
        user = User(username=username, email=current_user.email)
        db.add(user)
        db.flush()

    user.aws_access_key = aws.aws_access_key.strip()
    user.aws_secret_key = aws.aws_secret_key.strip()
    user.aws_region = aws.aws_region.strip()

    db.commit()
    db.refresh(user)

    return {"message": "AWS account connected successfully"}


@app.get("/user-ec2")
def user_ec2(
    current_user=Depends(verify_supabase_token),
    db: Session = Depends(get_db),
):
    print("================================")
    print("EMAIL:", current_user.email)

    user = db.query(User).filter(
        User.email == current_user.email
    ).first()

    print("USER FOUND:", user is not None)

    if user:
        print("AWS KEY EXISTS:", bool(user.aws_access_key))
        print("AWS SECRET EXISTS:", bool(user.aws_secret_key))
        print("AWS REGION:", user.aws_region)

    if not user:
        print("RETURNING: USER NOT FOUND")
        return []

    if not user.aws_access_key or not user.aws_secret_key or not user.aws_region:
        print("RETURNING: AWS CREDS MISSING")
        return []

    result = get_user_ec2_instances(user)

    print("EC2 COUNT:", len(result))
    print("================================")

    return result


@app.get("/aws-metrics")
def aws_metrics(
    current_user=Depends(verify_supabase_token),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == current_user.email
    ).first()

    if not user:
        return {
            "source": "cloudwatch",
            "region": None,
            "summary": {
                "cpu_usage": 0.0,
                "memory_usage": None,
                "severity": "stable",
                "health_score": 20,
                "alerts": 0,
                "running_instances": 0,
                "total_instances": 0,
            },
            "instances": [],
        }

    if not user.aws_access_key or not user.aws_secret_key or not user.aws_region:
        return {
            "source": "cloudwatch",
            "region": None,
            "summary": {
                "cpu_usage": 0.0,
                "memory_usage": None,
                "severity": "stable",
                "health_score": 20,
                "alerts": 0,
                "running_instances": 0,
                "total_instances": 0,
            },
            "instances": [],
        }

    return get_user_ec2_metrics(user)


@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            cpu = round(psutil.cpu_percent(interval=0.1), 1)
            memory = round(psutil.virtual_memory().percent, 1)

            docker_metrics = get_running_containers()
            containers = len(docker_metrics)
            k8s_pods = get_k8s_pods()

            alerts = random.randint(0, 5)
            severity = "stable"
            ai_message = "✅ Infrastructure stable"
            scaling = "No scaling required"

            health_score = 100 - ((cpu * 0.4) + (memory * 0.3) + (alerts * 5))
            health_score = max(20, round(health_score))

            if cpu > 90:
                severity = "critical"
                ai_message = "🚨 CRITICAL: CPU overload detected."
                scaling = "Deploy +3 backend pods"
            elif memory > 85:
                severity = "warning"
                ai_message = "⚠️ Memory usage spike detected."
                scaling = "Increase memory allocation"
            elif alerts > 3:
                severity = "warning"
                ai_message = "⚠️ Security alerts detected."
                scaling = "Run security audit"
            elif cpu > 75 and memory > 70:
                severity = "warning"
                ai_message = "🤖 Predictive AI detected future infrastructure load."
                scaling = "Pre-scale +2 pods"

            cloud_regions = [
                {
                    "provider": "AWS",
                    "region": "Mumbai",
                    "status": random.choice(["Healthy", "Warning"]),
                    "latency": random.randint(20, 80),
                },
                {
                    "provider": "Azure",
                    "region": "Singapore",
                    "status": random.choice(["Healthy", "Stable"]),
                    "latency": random.randint(30, 90),
                },
                {
                    "provider": "GCP",
                    "region": "Frankfurt",
                    "status": random.choice(["Healthy", "Critical"]),
                    "latency": random.randint(40, 120),
                },
            ]

            await websocket.send_json(
                {
                    "cpu_usage": cpu,
                    "memory_usage": memory,
                    "containers": containers,
                    "alerts": alerts,
                    "severity": severity,
                    "health_score": health_score,
                    "scaling": scaling,
                    "ai_message": ai_message,
                    "cloud_regions": cloud_regions,
                    "traffic_message": "🤖 AI recommends balancing traffic across cloud regions.",
                    "docker_metrics": docker_metrics,
                    "k8s_pods": k8s_pods,
                }
            )
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("Frontend disconnected")
    except Exception as e:
        print("WebSocket Error:", e)
        try:
            await websocket.close()
        except Exception:
            pass
