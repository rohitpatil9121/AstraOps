from datetime import datetime, timedelta, timezone

import boto3


def _make_ec2_client(user):
    return boto3.client(
        "ec2",
        aws_access_key_id=user.aws_access_key,
        aws_secret_access_key=user.aws_secret_key,
        region_name=user.aws_region,
    )


def _make_cloudwatch_client(user):
    return boto3.client(
        "cloudwatch",
        aws_access_key_id=user.aws_access_key,
        aws_secret_access_key=user.aws_secret_key,
        region_name=user.aws_region,
    )


def _latest_datapoint(datapoints):
    if not datapoints:
        return None
    return sorted(datapoints, key=lambda x: x["Timestamp"])[-1]


def _list_ec2_instances(user):
    if not user.aws_access_key or not user.aws_secret_key or not user.aws_region:
        return []

    ec2 = _make_ec2_client(user)
    response = ec2.describe_instances()
    instances = []

    for reservation in response.get("Reservations", []):
        for instance in reservation.get("Instances", []):
            instance_name = "Unknown"
            for tag in instance.get("Tags", []):
                if tag.get("Key") == "Name":
                    instance_name = tag.get("Value", "Unknown")
                    break

            instances.append(
                {
                    "name": instance_name,
                    "instance_id": instance.get("InstanceId", ""),
                    "state": instance.get("State", {}).get("Name", "unknown"),
                    "instance_type": instance.get("InstanceType", ""),
                    "public_ip": instance.get("PublicIpAddress", "N/A"),
                    "launch_time": instance.get("LaunchTime").isoformat() if instance.get("LaunchTime") else None,
                }
            )

    return instances


def _get_metric_value(
    user,
    namespace,
    metric_name,
    dimensions,
    statistic="Average",
    period=300,
    lookback_minutes=60,
):
    try:
        cloudwatch = _make_cloudwatch_client(user)

        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(minutes=lookback_minutes)

        response = cloudwatch.get_metric_statistics(
            Namespace=namespace,
            MetricName=metric_name,
            Dimensions=dimensions,
            StartTime=start_time,
            EndTime=end_time,
            Period=period,
            Statistics=[statistic],
        )

        datapoint = _latest_datapoint(response.get("Datapoints", []))
        if not datapoint:
            return None, None

        value = datapoint.get(statistic)
        timestamp = datapoint.get("Timestamp")
        return round(float(value), 1), timestamp

    except Exception as e:
        print(f"Metric Error ({namespace}/{metric_name}):", e)
        return None, None


def get_ec2_cpu_usage(user, instance_id):
    try:
        if not instance_id:
            return 0.0

        value, _timestamp = _get_metric_value(
            user=user,
            namespace="AWS/EC2",
            metric_name="CPUUtilization",
            dimensions=[{"Name": "InstanceId", "Value": instance_id}],
            statistic="Average",
            period=300,
            lookback_minutes=60,
        )
        return value or 0.0

    except Exception as e:
        print("CPU Metric Error:", e)
        return 0.0


def get_ec2_memory_usage(user, instance_id):
    # Requires CloudWatch Agent on the EC2 instance.
    value, _timestamp = _get_metric_value(
        user=user,
        namespace="CWAgent",
        metric_name="mem_used_percent",
        dimensions=[{"Name": "InstanceId", "Value": instance_id}],
        statistic="Average",
        period=300,
        lookback_minutes=60,
    )
    return value


def get_ec2_instance_status(user, instance_id):
    try:
        if not instance_id:
            return {
                "instance_status": "unknown",
                "system_status": "unknown",
                "status_check_failed": None,
            }

        ec2 = _make_ec2_client(user)

        response = ec2.describe_instance_status(
            InstanceIds=[instance_id],
            IncludeAllInstances=True,
        )

        statuses = response.get("InstanceStatuses", [])

        if not statuses:
            return {
                "instance_status": "unknown",
                "system_status": "unknown",
                "status_check_failed": None,
            }

        item = statuses[0]

        instance_status = (
            item.get("InstanceStatus", {})
            .get("Status", "unknown")
        )

        system_status = (
            item.get("SystemStatus", {})
            .get("Status", "unknown")
        )

        # Ignore stopped instances
        if (
            instance_status == "not-applicable"
            and system_status == "not-applicable"
        ):
            failed = 0
        else:
            failed = (
                1
                if instance_status != "ok"
                or system_status != "ok"
                else 0
            )

        return {
            "instance_status": instance_status,
            "system_status": system_status,
            "status_check_failed": failed,
        }

    except Exception as e:
        print("Instance Status Error:", e)

        return {
            "instance_status": "unknown",
            "system_status": "unknown",
            "status_check_failed": None,
        }
    
def get_user_ec2_instances(user):
    try:
        instances = _list_ec2_instances(user)
        for instance in instances:
            instance["cpu"] = get_ec2_cpu_usage(user, instance.get("instance_id", ""))
        return instances

    except Exception as e:
        print("EC2 Error:", e)
        return []

def generate_operational_insights(
    avg_cpu,
    avg_memory,
    alerts,
    running_instances,
):
    insights = []

    if running_instances == 0:
        insights.append(
            "No running EC2 instances detected."
        )

    if avg_cpu < 50:
        insights.append(
            f"CPU utilization is normal ({avg_cpu}%)."
        )
    elif avg_cpu < 80:
        insights.append(
            f"CPU utilization is elevated ({avg_cpu}%)."
        )
    else:
        insights.append(
            f"High CPU utilization detected ({avg_cpu}%)."
        )

    if avg_memory is not None:
        if avg_memory < 70:
            insights.append(
                f"Memory utilization is normal ({avg_memory}%)."
            )
        elif avg_memory < 85:
            insights.append(
                f"Memory utilization is elevated ({avg_memory}%)."
            )
        else:
            insights.append(
                f"High memory utilization detected ({avg_memory}%)."
            )

    if alerts == 0:
        insights.append(
            "No active infrastructure alerts."
        )
    else:
        insights.append(
            f"{alerts} active infrastructure alerts detected."
        )

    return insights
def generate_alerts(summary, instances):
    alerts = []

    avg_cpu = summary.get("cpu_usage", 0.0)
    avg_memory = summary.get("memory_usage")
    running_instances = summary.get("running_instances", 0)

    # No running instances
    if running_instances == 0:
        alerts.append(
            {
                "severity": "critical",
                "title": "No running EC2 instances",
                "description": "No EC2 instances are currently running in this account.",
                "recommendation": "Start at least one production instance or verify deployment health.",
                "source": "cloudwatch",
            }
        )

    # Average CPU thresholds
    if avg_cpu >= 90:
        alerts.append(
            {
                "severity": "critical",
                "title": "High average CPU utilization",
                "description": f"Average EC2 CPU usage is {avg_cpu}%.",
                "recommendation": "Scale up capacity or inspect the busiest instance.",
                "source": "cloudwatch",
            }
        )
    elif avg_cpu >= 70:
        alerts.append(
            {
                "severity": "warning",
                "title": "Elevated average CPU utilization",
                "description": f"Average EC2 CPU usage is {avg_cpu}%.",
                "recommendation": "Monitor load and prepare for scaling if usage continues.",
                "source": "cloudwatch",
            }
        )

    # Average memory thresholds
    if avg_memory is not None:
        if avg_memory >= 90:
            alerts.append(
                {
                    "severity": "critical",
                    "title": "High average memory utilization",
                    "description": f"Average memory usage is {avg_memory}%.",
                    "recommendation": "Investigate memory pressure and restart or scale services if needed.",
                    "source": "cloudwatch",
                }
            )
        elif avg_memory >= 75:
            alerts.append(
                {
                    "severity": "warning",
                    "title": "Elevated average memory utilization",
                    "description": f"Average memory usage is {avg_memory}%.",
                    "recommendation": "Watch memory growth and review running processes.",
                    "source": "cloudwatch",
                }
            )

    # Running instance health checks
    for instance in instances:
        if instance.get("state") != "running":
            continue

        if instance.get("status_check_failed") == 1:
            alerts.append(
                {
                    "severity": "critical",
                    "title": f"Status check failed: {instance.get('name', 'Unknown')}",
                    "description": (
                        f"Instance {instance.get('instance_id', '')} is running but failed system or instance checks."
                    ),
                    "recommendation": "Inspect the instance logs, network, and OS health immediately.",
                    "source": "ec2",
                    "instance_id": instance.get("instance_id"),
                }
            )

        if instance.get("cpu_usage", 0) >= 90:
            alerts.append(
                {
                    "severity": "critical",
                    "title": f"Instance CPU spike: {instance.get('name', 'Unknown')}",
                    "description": f"{instance.get('name', 'Unknown')} CPU is {instance.get('cpu_usage')}%.",
                    "recommendation": "Scale this instance or inspect the active workload.",
                    "source": "cloudwatch",
                    "instance_id": instance.get("instance_id"),
                }
            )
        elif instance.get("cpu_usage", 0) >= 70:
            alerts.append(
                {
                    "severity": "warning",
                    "title": f"Instance CPU elevated: {instance.get('name', 'Unknown')}",
                    "description": f"{instance.get('name', 'Unknown')} CPU is {instance.get('cpu_usage')}%.",
                    "recommendation": "Monitor workload trends and plan capacity if needed.",
                    "source": "cloudwatch",
                    "instance_id": instance.get("instance_id"),
                }
            )

        mem = instance.get("memory_usage")
        if mem is not None and mem >= 90:
            alerts.append(
                {
                    "severity": "critical",
                    "title": f"Instance memory spike: {instance.get('name', 'Unknown')}",
                    "description": f"{instance.get('name', 'Unknown')} memory is {mem}%.",
                    "recommendation": "Investigate memory leaks or memory-heavy workloads.",
                    "source": "cloudwatch",
                    "instance_id": instance.get("instance_id"),
                }
            )
        elif mem is not None and mem >= 75:
            alerts.append(
                {
                    "severity": "warning",
                    "title": f"Instance memory elevated: {instance.get('name', 'Unknown')}",
                    "description": f"{instance.get('name', 'Unknown')} memory is {mem}%.",
                    "recommendation": "Review memory usage and prepare for scaling if necessary.",
                    "source": "cloudwatch",
                    "instance_id": instance.get("instance_id"),
                }
            )

    # Sort critical first, then warning, then info
    priority = {"critical": 0, "warning": 1, "info": 2}
    alerts.sort(key=lambda x: priority.get(x.get("severity", "info"), 9))
    return alerts
def get_ec2_metric_history(
    user,
    instance_id,
    metric_name,
    namespace,
    period=300,
    lookback_hours=1,
):
    try:
        cloudwatch = _make_cloudwatch_client(user)

        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(hours=lookback_hours)

        response = cloudwatch.get_metric_statistics(
            Namespace=namespace,
            MetricName=metric_name,
            Dimensions=[
                {
                    "Name": "InstanceId",
                    "Value": instance_id,
                }
            ],
            StartTime=start_time,
            EndTime=end_time,
            Period=period,
            Statistics=["Average"],
        )

        datapoints = sorted(
            response.get("Datapoints", []),
            key=lambda x: x["Timestamp"]
        )

        return [
            {
                "timestamp": point["Timestamp"].isoformat(),
                "value": round(
                    float(point["Average"]),
                    2
                ),
            }
            for point in datapoints
        ]

    except Exception as e:
        print("Metric History Error:", e)
        return []

def get_user_metric_history(user):
    instances = _list_ec2_instances(user)

    running = next(
        (
            i
            for i in instances
            if i.get("state") == "running"
        ),
        None,
    )

    if not running:
        return {
            "cpu": [],
            "memory": [],
        }

    instance_id = running["instance_id"]

    cpu_history = get_ec2_metric_history(
        user=user,
        instance_id=instance_id,
        metric_name="CPUUtilization",
        namespace="AWS/EC2",
    )

    memory_history = get_ec2_metric_history(
        user=user,
        instance_id=instance_id,
        metric_name="mem_used_percent",
        namespace="CWAgent",
    )

    return {
        "cpu": cpu_history,
        "memory": memory_history,
    }
    
def get_user_ec2_metrics(user):
    try:
        instances = _list_ec2_instances(user)
        enriched = []

        cpu_values = []
        memory_values = []
        alerts = 0

        for instance in instances:
            instance_id = instance.get("instance_id", "")

            cpu = get_ec2_cpu_usage(user, instance_id)
            memory = get_ec2_memory_usage(user, instance_id)
            status = get_ec2_instance_status(user, instance_id)

            if instance.get("state") == "running":

                if cpu is not None:
                    cpu_values.append(cpu)

                if memory is not None:
                    memory_values.append(memory)
            if (
                instance.get("state") == "running"
                and status.get("status_check_failed") == 1
            ):
                alerts += 1

            if cpu >= 80:
                alerts += 1

            if memory is not None and memory >= 80:
                alerts += 1

            enriched.append(
                {
                    **instance,
                    "cpu_usage": cpu,
                    "memory_usage": memory,
                    **status,
                }
            )

        avg_cpu = (
            round(sum(cpu_values) / len(cpu_values), 1)
            if cpu_values
            else 0.0
        )

        avg_memory = (
            round(sum(memory_values) / len(memory_values), 1)
            if memory_values
            else None
        )

        running_instances = len(
            [
                i
                for i in enriched
                if i.get("state") == "running"
            ]
        )

        severity = "stable"

        if any(
            i.get("state") == "running"
            and i.get("status_check_failed") == 1
            for i in enriched
        ):
            severity = "critical"

        elif (
            avg_cpu >= 70
            or (
                avg_memory is not None
                and avg_memory >= 75
            )
        ):
            severity = "warning"

        health_score = (
            100
            - int(avg_cpu * 0.5)
            - (
                int(avg_memory * 0.3)
                if avg_memory is not None
                else 0
            )
            - (alerts * 10)
        )

        health_score = max(
            20,
            min(100, health_score),
        )

        insights = generate_operational_insights(
            avg_cpu,
            avg_memory,
            alerts,
            running_instances,
        )

        summary = {
            "cpu_usage": avg_cpu,
            "memory_usage": avg_memory,
            "severity": severity,
            "health_score": health_score,
            "alerts": 0,
            "running_instances": running_instances,
            "total_instances": len(enriched),
        }

        alerts_list = generate_alerts(
            summary,
            enriched,
        )

        summary["alerts"] = len(alerts_list)

        if any(
            alert.get("severity") == "critical"
            for alert in alerts_list
        ):
            summary["severity"] = "critical"

        elif any(
            alert.get("severity") == "warning"
            for alert in alerts_list
        ):
            summary["severity"] = "warning"

        return {
            "source": "cloudwatch",
            "region": user.aws_region,
            "insights": insights,
            "summary": summary,
            "alerts": alerts_list,
            "instances": enriched,
        }

    except Exception as e:
        print("AWS Metrics Error:", e)

        return {
            "source": "cloudwatch",
            "region": getattr(user, "aws_region", None),
            "summary": {
                "cpu_usage": 0.0,
                "memory_usage": None,
                "severity": "stable",
                "health_score": 20,
                "alerts": 0,
                "running_instances": 0,
                "total_instances": 0,
            },
            "alerts": [],
            "instances": [],
        }