ENV = backend/.env
BACK = backend/node_modules
FRONT = frontend/node_modules
DIST = frontend/dist

all: $(ENV)
	@echo "🔧 Installing dependecies..."
	@echo "Compilation done ✅"
	@if [ ! -d $(BACK) ] || [ ! -d $(FRONT) ] || [! -d $(DIST) ]; then \
		npm run build; \
	fi
	@echo "Build done ✅"
	@npm run start

$(ENV):
	@if [ ! -f $(ENV) ]; then \
		echo "PORT=3000" >> $(ENV); \
		echo "NODE_ENV=development" >> $(ENV); \
	fi
