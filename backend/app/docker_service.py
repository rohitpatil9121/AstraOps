try:
    import docker
except Exception:
    docker = None

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client

    if docker is None:
        return None

    try:
        _client = docker.from_env()
    except Exception as e:
        print("Docker Connection Error:", e)
        _client = None

    return _client


def get_running_containers():
    try:
        client = _get_client()
        if client is None:
            return []

        data = []
        for container in client.containers.list():
            data.append(
                {
                    "name": container.name,
                    "status": container.status,
                    "image": (container.image.tags or ["unknown"])[0],
                }
            )
        return data
    except Exception as e:
        print("Docker Fetch Error:", e)
        return []
