try:
    from kubernetes import client, config
except Exception:
    client = None
    config = None

_v1 = None


def _get_v1():
    global _v1
    if _v1 is not None:
        return _v1

    if client is None or config is None:
        return None

    try:
        try:
            config.load_kube_config()
        except Exception:
            config.load_incluster_config()
        _v1 = client.CoreV1Api()
        return _v1
    except Exception as e:
        print("K8S Init Error:", e)
        return None


def get_k8s_pods():
    try:
        v1 = _get_v1()
        if v1 is None:
            return []

        pods_data = []
        pods = v1.list_pod_for_all_namespaces(watch=False)

        for pod in pods.items:
            pods_data.append(
                {
                    "name": pod.metadata.name,
                    "namespace": pod.metadata.namespace,
                    "status": pod.status.phase,
                    "node": pod.spec.node_name,
                    "restarts": sum(
                        cs.restart_count for cs in (pod.status.container_statuses or [])
                    ),
                }
            )

        return pods_data

    except Exception as e:
        print("K8S Error:", e)
        return []
