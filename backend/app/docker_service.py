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
        print("Docker SDK not installed")
        return None

    # Windows Docker Desktop fallback first
    try:
        _client = docker.DockerClient(base_url="npipe:////./pipe/docker_engine")
        _client.ping()
        return _client
    except Exception as e:
        print("Docker Connection Error (npipe):", e)

    # Linux / WSL fallback
    try:
        _client = docker.from_env()
        _client.ping()
        return _client
    except Exception as e:
        print("Docker Connection Error (from_env):", e)
        _client = None
        return None


def get_running_containers():
    try:
        client = _get_client()

        print("CLIENT:", client)

        if client is None:
            return []

        # only running containers
        containers = client.containers.list()

        print("CONTAINERS FOUND:", len(containers))

        data = []
        for container in containers:
            print(container.name, container.status)

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