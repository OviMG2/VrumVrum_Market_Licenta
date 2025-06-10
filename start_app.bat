@echo off
echo Pornire aplicatie Auto Marketplace...

cd %~dp0
start cmd /k "cd auto_marketplace && call venv\Scripts\activate && cd auto_marketplace_backend && python manage.py runserver"
start cmd /k "cd auto_marketplace && cd auto-marketplace-frontend && npm start"

echo Aplicatia a fost pornita!