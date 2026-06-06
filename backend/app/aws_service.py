from datetime import datetime, timedelta

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


def get_user_ec2_instances(user):
    try:
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
                        "cpu": get_ec2_cpu_usage(user, instance.get("InstanceId", "")),
                    }
                )

        return instances

    except Exception as e:
        print("EC2 Error:", e)
        return []


def get_ec2_cpu_usage(user, instance_id):
    try:
        if not instance_id:
            return 0

        cloudwatch = _make_cloudwatch_client(user)

        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=10)

        metrics = cloudwatch.get_metric_statistics(
            Namespace="AWS/EC2",
            MetricName="CPUUtilization",
            Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=300,
            Statistics=["Average"],
        )

        datapoints = metrics.get("Datapoints", [])
        if datapoints:
            latest = sorted(datapoints, key=lambda x: x["Timestamp"])[-1]
            return round(latest.get("Average", 0), 1)

        return 0

    except Exception as e:
        print("CPU Metric Error:", e)
        return 0
