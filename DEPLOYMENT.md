# Deployment Guide for Healthcare Portal

## Prerequisites
- GitHub account
- Vercel account
- PostgreSQL database (production)
- Vercel Blob storage enabled

## Step 1: Push to GitHub

### Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., "healthcare-portal")
3. **DO NOT** initialize with README, .gitignore, or license (we have these)

### Add Remote and Push
```bash
# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verify remote was added
git remote -v

# Push code to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/import
2. Select "Import Git Repository"
3. Paste your GitHub repository URL
4. Click "Continue"
5. Configure project:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./ (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
6. Click "Deploy"

### Option B: Using Vercel CLI
```bash
npm install -g vercel
vercel
# Follow the prompts to link your GitHub repository
```

## Step 3: Configure Environment Variables in Vercel

After import/initial deployment, go to your Vercel project dashboard:

1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables for **Production**:

```
DATABASE_URL = postgresql://user:password@prod-server:5432/healthcare_portal
NEXTAUTH_SECRET = generate-a-secure-random-string-for-production
NEXTAUTH_URL = https://your-vercel-domain.vercel.app
BLOB_READ_WRITE_TOKEN = your-vercel-blob-token
NEXT_PUBLIC_API_URL = https://your-vercel-domain.vercel.app
```

### Generate Secure Secrets
For NEXTAUTH_SECRET, generate a secure random string:
```bash
openssl rand -base64 32
```

### Getting Vercel Blob Token
1. Go to https://vercel.com/account/storage
2. Create a new Blob store or use existing
3. Copy the token to BLOB_READ_WRITE_TOKEN

### PostgreSQL Production Database
Set up a production PostgreSQL database:
- Options: Vercel Postgres, AWS RDS, Railway, or other providers
- Once created, update DATABASE_URL with production credentials
- Run migrations if needed: `npx prisma migrate deploy`

## Step 4: Test Production Deployment

Once environment variables are set:

1. Go to **Deployments** in Vercel dashboard
2. Wait for build to complete (typically 2-3 minutes)
3. Click the deployment URL
4. Test the following flows:
   - Sign up as patient, doctor, admin
   - Patient books appointment
   - Doctor creates prescription
   - Admin creates staff shift
   - Profile picture upload
   - Sign out and login again

## Step 5: Custom Domain (Optional)

1. In Vercel project dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update NEXTAUTH_URL with new domain:
   ```
   NEXTAUTH_URL = https://yourdomain.com
   ```

## Monitoring and Maintenance

### View Logs
- Vercel Dashboard → **Deployments** → Select deployment → **View Logs**

### Automatic Deployments
- Vercel automatically deploys on every push to `main` branch
- View deployment history in **Deployments** tab

### Environment Variables
- Changes to environment variables require a manual redeployment
- Use **Deployments** → **Redeploy** option

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Common issues:
  - Missing environment variables
  - Database connection issues
  - Invalid Node.js version

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify all API endpoints have proper error handling
- Ensure database is accessible from Vercel

### Database Connection Issues
- Verify DATABASE_URL format
- Ensure production database allows connections from Vercel IPs
- Check database credentials and network access

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database migrations are run
- [ ] Application builds successfully
- [ ] Sign up flow works
- [ ] Appointment booking works
- [ ] Prescription creation works
- [ ] File uploads work (Vercel Blob)
- [ ] Navigation works for all roles
- [ ] Sign out redirects properly
- [ ] Role-based access control is enforced
- [ ] Error pages display correctly

## Rollback (If Needed)

If deployment has issues, you can rollback:
1. Go to **Deployments** in Vercel dashboard
2. Find the previous working deployment
3. Click the three dots menu
4. Select "Promote to Production"

## CI/CD Pipeline

The deployment is automatically triggered on every push to the `main` branch. For more complex CI/CD, you can:
1. Add GitHub Actions workflows
2. Add pre-deployment tests
3. Set up staging environments

---

## Support Links
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
- [Prisma Database Setup](https://www.prisma.io/docs/orm/overview/databases)
- [NextAuth.js Documentation](https://next-auth.js.org/)
