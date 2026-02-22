#!/bin/bash
set -e

DOMAIN="kwaleebeachresort.com"
DB_NAME="kwalee_db"
DB_USER="kwalee_user"
DB_PASS="KwaleeBeach2026!"
REPO_URL="https://github.com/HILTONJACKSO/Kwaleebeach.git"
WEB_DIR="/var/www/kwaleebeach"
DJANGO_PORT=8001
NEXTJS_PORT=3001

echo "Starting deployment for Kwalee Beach Resort..."

# 0. Install Dependencies
echo "Installing system dependencies..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib python3-venv python3-pip libpq-dev python3-dev nodejs nginx

# 1. Database Setup
echo "Setting up PostgreSQL Database..."
systemctl start postgresql

# Temporarily allow peer authentication for all local connections so script can run
PG_HBA=$(find /etc/postgresql/ -name "pg_hba.conf" | head -n 1)
sed -i 's/md5/peer/g' $PG_HBA
systemctl restart postgresql

sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" || true
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" || true
sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET client_encoding TO 'utf8';" || true
sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET default_transaction_isolation TO 'read committed';" || true
sudo -u postgres psql -c "ALTER ROLE ${DB_USER} SET timezone TO 'UTC';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true
sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};" || true

# Reset password BEFORE changing auth method
sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" || true

# Update pg_hba.conf to allow password authentication
PG_HBA=$(find /etc/postgresql/ -name "pg_hba.conf" | head -n 1)
sed -i 's/peer/md5/g' $PG_HBA
sed -i 's/scram-sha-256/md5/g' $PG_HBA
systemctl restart postgresql

# 2. Clone Repository
echo "Setting up directory..."
if [ -d "$WEB_DIR" ]; then
    echo "Directory exists. Pulling latest code..."
    cd $WEB_DIR
    git pull origin main
else
    echo "Cloning repository..."
    mkdir -p $WEB_DIR
    git clone $REPO_URL $WEB_DIR
    cd $WEB_DIR
fi

# 3. Backend Setup
echo "Setting up Django Backend..."
cd $WEB_DIR/backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
# Update settings to use new DB - actually we'll pass env vars to systemd or edit settings directly.
# Let's just create a quick sed script to update the DATABASES in settings.py if it's currently set to postgres/pandora etc.
# Configure Django Settings for Database
sed -i "s/'NAME': 'yarvo'/'NAME': '${DB_NAME}'/g" yarvo_backend/settings.py
sed -i "s/'USER': 'postgres'/'USER': '${DB_USER}'/g" yarvo_backend/settings.py
sed -i "s/'PASSWORD': 'Password@pos1'/'PASSWORD': '${DB_PASS}'/g" yarvo_backend/settings.py
sed -i "s/'HOST': 'localhost'/'HOST': '127.0.0.1'/g" yarvo_backend/settings.py
sed -i "s/ALLOWED_HOSTS = \[\]/ALLOWED_HOSTS = \['localhost', '127.0.0.1', '${DOMAIN}'\]/g" yarvo_backend/settings.py
sed -i "/STATIC_URL = 'static\/'/a STATIC_ROOT = BASE_DIR \/ 'staticfiles'" yarvo_backend/settings.py

# Force IPv4 host system-wide for psql
echo "listen_addresses = 'localhost, 127.0.0.1'" | sudo tee -a /etc/postgresql/16/main/postgresql.conf
systemctl restart postgresql

# Force IPv4 host system-wide for psql
echo "listen_addresses = 'localhost, 127.0.0.1'" | sudo tee -a /etc/postgresql/16/main/postgresql.conf
systemctl restart postgresql
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# 4. Configure Backend Systemd Service
echo "Creating Gunicorn Systemd Service..."
cat <<EOF > /etc/systemd/system/gunicorn-kwalee.service
[Unit]
Description=Gunicorn daemon for Kwalee
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=$WEB_DIR/backend
ExecStart=$WEB_DIR/backend/venv/bin/gunicorn --access-logfile - --workers 3 --bind 127.0.0.1:$DJANGO_PORT yarvo_backend.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gunicorn-kwalee
systemctl restart gunicorn-kwalee

# 5. Frontend Setup
echo "Setting up Next.js Frontend..."
cd $WEB_DIR/frontend
# Update API calls to point to production domain.
# API calls now use relative paths, handled by central config or Next.js proxy/Nginx.
npm install
npm run build

# 6. Configure Frontend Systemd Service
echo "Creating Next.js Systemd Service..."
cat <<EOF > /etc/systemd/system/nextjs-kwalee.service
[Unit]
Description=Next.js frontend for Kwalee
After=network.target

[Service]
User=root
WorkingDirectory=$WEB_DIR/frontend
Environment=PORT=$NEXTJS_PORT
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nextjs-kwalee
systemctl restart nextjs-kwalee

# 7. Configure Nginx
echo "Configuring Nginx..."
cat <<EOF > /etc/nginx/sites-available/kwalee
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:$NEXTJS_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:$DJANGO_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /admin/ {
        proxy_pass http://127.0.0.1:$DJANGO_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias $WEB_DIR/backend/staticfiles/;
    }
    
    location /media/ {
        alias $WEB_DIR/backend/media/;
    }
}
EOF

ln -sf /etc/nginx/sites-available/kwalee /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo "Deployment Script Completed!"
