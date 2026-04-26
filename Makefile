.PHONY: dev-web dev-server dev docker-build docker-up docker-down

dev-web:
	cd lingo_cube_web && npm run dev

dev-server:
	cd lingo_cube_server && go run main.go

dev:
	@echo "Run dev-web and dev-server in separate terminals"

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
