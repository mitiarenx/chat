ENV = backend/.env
BACK = backend/node_modules
FRONT = frontend/node_modules
DIST = frontend/dist

all: $(ENV)
	@echo "🔧 Installing dependecies..."
	@echo "Compilation done ✅"
	@if [ ! -d $(BACK) ] || [ ! -d $(FRONT) ] || [ ! -d $(DIST) ]; then \
		npm run build; \
	fi
	@echo "Build done ✅"
	@npm run start

$(ENV):
	@if [ ! -f $(ENV) ]; then \
		echo "PORT=3000" >> $(ENV); \
		echo "NODE_ENV=development" >> $(ENV); \
		echo "JWT_SECRET=jwtsecret" >> $(ENV); \
		echo "EMAIL_FROM=onboarding@resend.dev" >> $(ENV); \
		echo "EMAIL_NAME=Pong" >> $(ENV); \
		echo "API_CHAT=re_65rQ8n9X_LnVZTBbfhDnwh5Vv3VxVmXbm" >> $(ENV); \
	fi
	