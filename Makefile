.PHONY: config up down logs ps

config:
	docker compose config
up:
	docker compose up -d --remove-orphans
down:
	docker compose down
logs:
	docker compose logs -f --tail=200
ps:
	docker compose ps