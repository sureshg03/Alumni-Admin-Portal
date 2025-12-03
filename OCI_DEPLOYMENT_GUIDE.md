# 🚀 Complete Guide: Deploy Alumni Project on Oracle Cloud Infrastructure (FREE)

## 📋 What You'll Get (100% Free Forever)
- **2 AMD Compute Instances** (1 GB RAM each) - for Backend & Frontend
- **MySQL Database** (up to 50 GB storage)
- **200 GB Block Storage**
- **10 TB Outbound Data Transfer/month**

---

## 🎯 PART 1: Create Oracle Cloud Account

### Step 1: Sign Up for Oracle Cloud Free Tier
1. Go to: https://www.oracle.com/cloud/free/
2. Click **"Start for free"**
3. Fill in your details:
   - Email address
   - Country
   - First & Last Name
4. Verify your email
5. Complete the registration form:
   - Create a password
   - Choose **Home Region** (IMPORTANT: Cannot be changed later)
     - Recommended: Choose closest to your users
     - India: Mumbai (ap-mumbai-1) or Hyderabad (ap-hyderabad-1)
6. Add payment verification:
   - Credit/Debit card required (₹2 will be charged and refunded)
   - No charges unless you upgrade manually
7. Wait for account provisioning (5-10 minutes)

---

## 🎯 PART 2: Set Up MySQL Database

### Step 1: Create MySQL Database Instance

1. **Log in to Oracle Cloud Console**
   - URL: https://cloud.oracle.com/
   - Sign in with your credentials

2. **Navigate to MySQL Database**
   - Click ☰ (hamburger menu) → **Databases** → **MySQL** → **DB Systems**
   - Or search "MySQL" in the search bar

3. **Create DB System**
   - Click **"Create DB System"**
   - Fill in the details:

   **Basic Information:**
   ```
   Name: alumni-mysql-db
   Description: MySQL database for Alumni Portal
   ```

   **Administrator Credentials:**
   ```
   Username: admin
   Password: Create a strong password (save it!)
   Confirm Password: (same as above)
   ```
   ⚠️ **IMPORTANT**: Save these credentials securely!

   **Network Configuration:**
   - Select your **Compartment** (usually "root" for new accounts)
   - **Virtual Cloud Network (VCN)**: Create new VCN or select existing
   - **Subnet**: Select public subnet
   - Enable **Public IP Address** (Important!)

   **Configure Placement:**
   - Leave as default (will use availability domain automatically)

   **Hardware Configuration:**
   - **Shape**: Select **MySQL.Free** (1 GB RAM, 1 OCPU)
   - **Data Storage Size**: 50 GB (maximum for free tier)

   **Backup:**
   - Enable Automatic Backups: ✓ (Recommended)
   - Retention Period: 7 days

4. **Click "Create"**
   - Wait 10-15 minutes for provisioning
   - Status will change from "Creating" → "Active"

5. **Note Down Important Details:**
   ```
   MySQL Endpoint: <note the endpoint URL>
   Port: 3306
   Username: admin
   Password: <your password>
   ```

### Step 2: Configure MySQL Security Rules

1. **Find your DB System's VCN**
   - Click on your MySQL DB System
   - Note the **Virtual Cloud Network** name

2. **Configure Security List**
   - Go to: ☰ → **Networking** → **Virtual Cloud Networks**
   - Click on your VCN
   - Click **Security Lists** → Click on Default Security List

3. **Add Ingress Rule for MySQL**
   - Click **Add Ingress Rules**
   - Fill in:
   ```
   Source Type: CIDR
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Source Port Range: All
   Destination Port Range: 3306
   Description: MySQL access
   ```
   - Click **Add Ingress Rules**

4. **Add Ingress Rules for Web Traffic** (we'll need these later)
   - Add Rule 1 (HTTP):
   ```
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Destination Port Range: 80
   Description: HTTP traffic
   ```
   - Add Rule 2 (HTTPS):
   ```
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Destination Port Range: 443
   Description: HTTPS traffic
   ```
   - Add Rule 3 (Django Backend):
   ```
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Destination Port Range: 8000
   Description: Django Backend
   ```
   - Add Rule 4 (React Frontend):
   ```
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Destination Port Range: 5173
   Description: React Dev Server
   ```

### Step 3: Create Database and Import Schema

1. **Connect to MySQL from your local machine** (Install MySQL client if needed)
   ```bash
   mysql -h <MYSQL_ENDPOINT> -u admin -p
   ```
   - Enter your password when prompted

2. **Create Alumni Database:**
   ```sql
   CREATE DATABASE alumni_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE alumni_portal;
   ```

3. **Import your schema** (if you have schema.sql):
   ```bash
   mysql -h <MYSQL_ENDPOINT> -u admin -p alumni_portal < backend/schema.sql
   ```

---

## 🎯 PART 3: Create Compute Instances

### Step 1: Create Backend Instance (Django)

1. **Navigate to Compute**
   - Click ☰ → **Compute** → **Instances**
   - Click **Create Instance**

2. **Configure Instance:**
   
   **Name:**
   ```
   alumni-backend-server
   ```

   **Placement:**
   - Leave as default (Availability Domain will be selected)

   **Image and Shape:**
   - Click **"Edit"** on Image and Shape
   - **Image**: Select **Ubuntu 22.04** (Latest)
   - Click **"Change Shape"**
   - Select **"Ampere"** → **VM.Standard.A1.Flex**
   - **OCPUs**: 1
   - **Memory (GB)**: 6 (or use default for A1 free tier)
   - ⚠️ **Alternative**: Use **VM.Standard.E2.1.Micro** (AMD, 1GB RAM) - Always Free

3. **Networking:**
   - Select the same **VCN** as your MySQL database
   - Select **Public Subnet**
   - Check ✓ **Assign a public IPv4 address**

4. **Add SSH Keys:**
   - Select **"Generate SSH key pair for me"**
   - Click **Save Private Key** (save as `backend-key.pem`)
   - Click **Save Public Key** (optional)
   ⚠️ **CRITICAL**: Save this key - you cannot download it again!

5. **Click "Create"**
   - Wait 2-3 minutes
   - Note the **Public IP Address**

### Step 2: Create Frontend Instance (React)

1. **Repeat the same process** with these changes:
   
   **Name:**
   ```
   alumni-frontend-server
   ```

2. **Same configuration** as backend:
   - Ubuntu 22.04
   - VM.Standard.E2.1.Micro (1GB RAM) or A1.Flex
   - Same VCN and Public Subnet
   - Generate new SSH key pair (save as `frontend-key.pem`)

3. **Note the Public IP Address**

---

## 🎯 PART 4: Deploy Django Backend

### Step 1: Connect to Backend Instance

**For Windows (PowerShell):**
```powershell
# Set proper permissions for SSH key
icacls "backend-key.pem" /inheritance:r
icacls "backend-key.pem" /grant:r "$($env:USERNAME):(R)"

# Connect to instance
ssh -i backend-key.pem ubuntu@<BACKEND_PUBLIC_IP>
```

**Alternative (Use PuTTY):**
1. Download PuTTY: https://www.putty.org/
2. Convert `.pem` to `.ppk` using PuTTYgen
3. Connect using PuTTY with the `.ppk` file

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install MySQL client
sudo apt install mysql-client libmysqlclient-dev pkg-config -y

# Install Nginx (web server)
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### Step 3: Clone Your Project

```bash
# Create directory
mkdir -p ~/apps
cd ~/apps

# Option 1: If your project is on GitHub
git clone https://github.com/yourusername/Alumni-Admin.git
cd Alumni-Admin/backend

# Option 2: If not on GitHub, we'll upload files later
# For now, create the directory structure
mkdir -p ~/apps/alumni-backend
cd ~/apps/alumni-backend
```

### Step 4: Upload Backend Files (If Not Using Git)

**On your local Windows machine:**
```powershell
# Navigate to your backend directory
cd e:\Alumni-Admin\Alumni-Admin\backend

# Upload files using SCP
scp -i backend-key.pem -r * ubuntu@<BACKEND_PUBLIC_IP>:~/apps/alumni-backend/
```

### Step 5: Set Up Python Virtual Environment

```bash
cd ~/apps/alumni-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install additional server requirements
pip install gunicorn
```

### Step 6: Create Environment Variables

```bash
# Create .env file
nano .env
```

**Add these contents** (replace with your actual values):
```env
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=<BACKEND_PUBLIC_IP>,localhost,127.0.0.1

# Database Configuration
DATABASE_URL=mysql://admin:<YOUR_MYSQL_PASSWORD>@<MYSQL_ENDPOINT>:3306/alumni_portal

# CORS Settings
CORS_ALLOWED_ORIGINS=http://<FRONTEND_PUBLIC_IP>:80,http://<FRONTEND_PUBLIC_IP>,https://<YOUR_DOMAIN>
CSRF_TRUSTED_ORIGINS=http://<FRONTEND_PUBLIC_IP>:80,http://<FRONTEND_PUBLIC_IP>,https://<YOUR_DOMAIN>

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 7: Run Database Migrations

```bash
# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### Step 8: Test Django Server

```bash
# Test run
python manage.py runserver 0.0.0.0:8000
```

Visit in browser: `http://<BACKEND_PUBLIC_IP>:8000`

Press `Ctrl+C` to stop the server

### Step 9: Configure Gunicorn

```bash
# Create Gunicorn configuration
nano ~/apps/alumni-backend/gunicorn_config.py
```

**Add:**
```python
bind = "0.0.0.0:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
errorlog = "/home/ubuntu/apps/alumni-backend/logs/gunicorn-error.log"
accesslog = "/home/ubuntu/apps/alumni-backend/logs/gunicorn-access.log"
loglevel = "info"
```

**Save and exit**

```bash
# Create logs directory
mkdir -p ~/apps/alumni-backend/logs
```

### Step 10: Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/alumni-backend.service
```

**Add:**
```ini
[Unit]
Description=Alumni Portal Django Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/apps/alumni-backend
Environment="PATH=/home/ubuntu/apps/alumni-backend/venv/bin"
ExecStart=/home/ubuntu/apps/alumni-backend/venv/bin/gunicorn \
    --config /home/ubuntu/apps/alumni-backend/gunicorn_config.py \
    backend.wsgi:application

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Save and exit**

```bash
# Reload systemd, enable and start service
sudo systemctl daemon-reload
sudo systemctl enable alumni-backend
sudo systemctl start alumni-backend

# Check status
sudo systemctl status alumni-backend
```

### Step 11: Configure Nginx for Backend

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/alumni-backend
```

**Add:**
```nginx
server {
    listen 80;
    server_name <BACKEND_PUBLIC_IP>;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/ubuntu/apps/alumni-backend/staticfiles/;
    }

    location /media/ {
        alias /home/ubuntu/apps/alumni-backend/media/;
    }
}
```

**Save and exit**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/alumni-backend /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 12: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Django (optional, for debugging)

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

✅ **Backend is now deployed!** Test at: `http://<BACKEND_PUBLIC_IP>`

---

## 🎯 PART 5: Deploy React Frontend

### Step 1: Connect to Frontend Instance

```powershell
# Set permissions
icacls "frontend-key.pem" /inheritance:r
icacls "frontend-key.pem" /grant:r "$($env:USERNAME):(R)"

# Connect
ssh -i frontend-key.pem ubuntu@<FRONTEND_PUBLIC_IP>
```

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### Step 3: Upload Frontend Files

**On your local Windows machine:**
```powershell
# Navigate to frontend directory
cd e:\Alumni-Admin\Alumni-Admin\admin-frontend

# Upload files
scp -i frontend-key.pem -r * ubuntu@<FRONTEND_PUBLIC_IP>:~/
```

**Or clone from Git:**
```bash
# On the server
cd ~
git clone https://github.com/yourusername/Alumni-Admin.git
cd Alumni-Admin/admin-frontend
```

### Step 4: Configure Environment Variables

```bash
cd ~/admin-frontend

# Create .env file
nano .env
```

**Add:**
```env
VITE_API_URL=http://<BACKEND_PUBLIC_IP>
```

**Save and exit**

### Step 5: Update API Configuration

```bash
# Edit axios configuration
nano src/api/axios.js
```

**Make sure it uses the environment variable:**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://<BACKEND_PUBLIC_IP>';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axiosInstance;
```

### Step 6: Build React Application

```bash
cd ~/admin-frontend

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist` folder with optimized production files.

### Step 7: Configure Nginx for Frontend

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/alumni-frontend
```

**Add:**
```nginx
server {
    listen 80;
    server_name <FRONTEND_PUBLIC_IP>;

    root /home/ubuntu/admin-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional - if you want to proxy backend through frontend)
    location /api/ {
        proxy_pass http://<BACKEND_PUBLIC_IP>/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

**Save and exit**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/alumni-frontend /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

✅ **Frontend is now deployed!** Visit: `http://<FRONTEND_PUBLIC_IP>`

---

## 🎯 PART 6: Domain Setup (Optional but Recommended)

### Step 1: Get a Free Domain (Optional)

**Free Domain Options:**
- Freenom: https://www.freenom.com (Free .tk, .ml, .ga domains)
- InfinityFree: https://infinityfree.com (Free subdomain)
- Or buy a cheap domain from Namecheap, GoDaddy ($1-10/year)

### Step 2: Configure DNS Records

Add these records in your domain provider:

```
Type: A
Name: backend (or @)
Value: <BACKEND_PUBLIC_IP>
TTL: 3600

Type: A
Name: www (or frontend)
Value: <FRONTEND_PUBLIC_IP>
TTL: 3600
```

### Step 3: Install SSL Certificate (Free with Let's Encrypt)

**On Backend Server:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d backend.yourdomain.com

# Follow prompts and select redirect option
```

**On Frontend Server:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Certificates auto-renew!**

---

## 🎯 PART 7: Maintenance & Monitoring

### Common Commands

**Backend Server:**
```bash
# View logs
sudo journalctl -u alumni-backend -f

# Restart backend
sudo systemctl restart alumni-backend

# Restart Nginx
sudo systemctl restart nginx

# Update code
cd ~/apps/alumni-backend
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart alumni-backend
```

**Frontend Server:**
```bash
# Update code
cd ~/admin-frontend
git pull
npm install
npm run build
sudo systemctl restart nginx
```

### Monitoring Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU usage
top

# Check Nginx status
sudo systemctl status nginx
```

### Database Backup

```bash
# Manual backup
mysqldump -h <MYSQL_ENDPOINT> -u admin -p alumni_portal > backup_$(date +%Y%m%d).sql

# Automate backups (crontab)
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * mysqldump -h <MYSQL_ENDPOINT> -u admin -p<PASSWORD> alumni_portal > ~/backups/alumni_$(date +\%Y\%m\%d).sql
```

---

## 🛠️ Troubleshooting

### Issue 1: Cannot Connect to MySQL
```bash
# Check MySQL endpoint is correct
# Verify security list allows port 3306
# Test connection:
mysql -h <MYSQL_ENDPOINT> -u admin -p
```

### Issue 2: Backend Not Starting
```bash
# Check logs
sudo journalctl -u alumni-backend -n 50

# Check if port is in use
sudo netstat -tulpn | grep 8000

# Restart service
sudo systemctl restart alumni-backend
```

### Issue 3: Frontend Shows Blank Page
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify build directory exists
ls -la ~/admin-frontend/dist/

# Rebuild frontend
cd ~/admin-frontend
npm run build
sudo systemctl restart nginx
```

### Issue 4: CORS Errors
- Update `CORS_ALLOWED_ORIGINS` in backend `.env`
- Update `CSRF_TRUSTED_ORIGINS` in backend `.env`
- Restart backend: `sudo systemctl restart alumni-backend`

### Issue 5: 502 Bad Gateway
```bash
# Backend is not running
sudo systemctl status alumni-backend
sudo systemctl start alumni-backend

# Check Gunicorn logs
tail -f ~/apps/alumni-backend/logs/gunicorn-error.log
```

---

## 📊 Cost Monitoring

**Always Free Resources (No expiry):**
- 2 AMD compute instances (1GB RAM each)
- 2 Arm-based Ampere A1 cores
- 200 GB Block Storage
- MySQL Database (50GB)
- 10 TB outbound data transfer/month

**Check Your Usage:**
1. Go to OCI Console
2. Click on your profile → **Tenancy**
3. View **Cost Analysis** and **Usage Reports**

⚠️ **Important:** Don't create resources outside the "Always Free" tier

---

## 🎉 Final Checklist

- [ ] MySQL Database created and accessible
- [ ] Backend instance created and SSH accessible
- [ ] Frontend instance created and SSH accessible
- [ ] Backend code deployed and running
- [ ] Frontend code built and served
- [ ] Security lists configured
- [ ] Firewall rules enabled
- [ ] Environment variables configured
- [ ] DNS configured (optional)
- [ ] SSL certificates installed (optional)
- [ ] Tested application end-to-end

---

## 📞 Support

**Oracle Cloud Support:**
- Documentation: https://docs.oracle.com/en-us/iaas/
- Community: https://community.oracle.com/

**Need Help?**
- Check logs first
- Review security list rules
- Verify environment variables
- Test each component separately

---

## 🚀 Quick Reference

### Your Instance IPs:
```
Backend Server: <BACKEND_PUBLIC_IP>
Frontend Server: <FRONTEND_PUBLIC_IP>
MySQL Endpoint: <MYSQL_ENDPOINT>
```

### SSH Connection:
```powershell
# Backend
ssh -i backend-key.pem ubuntu@<BACKEND_PUBLIC_IP>

# Frontend
ssh -i frontend-key.pem ubuntu@<FRONTEND_PUBLIC_IP>
```

### Application URLs:
```
Frontend: http://<FRONTEND_PUBLIC_IP>
Backend API: http://<BACKEND_PUBLIC_IP>
Admin Panel: http://<BACKEND_PUBLIC_IP>/admin
```

---

## 🎯 Next Steps After Deployment

1. **Set up automated backups**
2. **Configure monitoring alerts**
3. **Add domain name and SSL**
4. **Set up CI/CD pipeline** (GitHub Actions)
5. **Configure email notifications**
6. **Add analytics tracking**
7. **Performance optimization**

---

**Congratulations! Your Alumni Portal is now live on Oracle Cloud! 🎉**
