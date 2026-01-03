all:
	@docker compose up -d --build

install:
	@npm install --prefix backend && npm install --prefix frontend

dev:
	@npm run dev --prefix backend &
	@npm run dev --prefix frontend &

fclean:
	@docker compose down -v
	@docker system prune -a -f

re: fclean start

.PHONY: all fclean start install dev
