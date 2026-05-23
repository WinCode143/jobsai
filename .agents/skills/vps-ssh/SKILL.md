---
name: vps-ssh
description: Connects to the project VPS and runs commands remotely. Use when the user asks to deploy, check server status, run commands on the VPS, or manage services.
---

# VPS SSH Skill

Connect and run commands on the project VPS using sshpass.

## Connection details

- **Host:** 149.56.15.114
- **User:** debian
- **Port:** 22
- **Password:** stored in environment — use `sshpass -p '142536789bB**'`

## How to run a command

```bash
sshpass -p '142536789bB**' ssh -o StrictHostKeyChecking=no debian@149.56.15.114 "YOUR_COMMAND"
```

## How to run as root

```bash
sshpass -p '142536789bB**' ssh -o StrictHostKeyChecking=no debian@149.56.15.114 "echo '142536789bB**' | sudo -S YOUR_COMMAND"
```

## Common operations

- Check PM2 status: `pm2 status`
- Restart app: `pm2 reload ecosystem.config.js --update-env`
- Check Nginx: `sudo systemctl status nginx`
- Check logs: `pm2 logs jobsai-web --lines 50`
- App directory: `/var/www/jobsai`
