# SSL Certificates

## For Development (Self-signed)
Generate self-signed certificates:
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=20.171.31.113"
```

## For Production (Let's Encrypt)
Once you have a domain name pointing to your server:

1. Install certbot:
```bash
sudo apt update
sudo apt install certbot
```

2. Get certificates (replace yourdomain.com):
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. Copy certificates here:
```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem key.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem cert.pem
sudo chown $USER:$USER key.pem cert.pem
```

4. Set up auto-renewal:
```bash
sudo crontab -e
# Add: 0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /path/to/COCO/ssl/
```
