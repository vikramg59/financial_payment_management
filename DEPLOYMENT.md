# Deployment Guide for Parent Pay Pal

This guide provides instructions for deploying the Parent Pay Pal application across multiple platforms:
- Frontend: Vercel
- Backend: Render
- AI Service: Render

## Prerequisites

- GitHub repository with your code
- Accounts on Vercel and Render
- MongoDB Atlas account (for production database)
- Google API key for AI functionality

## Environment Setup

Each service requires specific environment variables to be set up in their respective deployment platforms.

### 1. Frontend (Vercel) Environment Variables

In your Vercel project settings, add these environment variables:

```
VITE_BACKEND_URL=https://your-backend-service-url.onrender.com
VITE_AI_SERVICE_URL=https://your-ai-service-url.onrender.com
```

### 2. Backend (Render) Environment Variables

In your Render service settings for the backend, add these environment variables:

```
PORT=10000
NODE_ENV=production
DATABASE_URL=mongodb+srv://your-mongodb-atlas-connection-string
CORS_ORIGIN=https://your-frontend-url.vercel.app
AI_SERVICE_URL=https://your-ai-service-url.onrender.com
JWT_SECRET=your-secure-jwt-secret
```

### 3. AI Service (Render) Environment Variables

In your Render service settings for the AI service, add these environment variables:

```
PORT=10000
GOOGLE_API_KEY=your-google-api-key
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Deployment Steps

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Log in to Vercel and create a new project
3. Connect to your GitHub repository
4. Select the `frontend` directory as the root directory
5. Set the framework preset to Vite
6. Add the environment variables listed above
7. Deploy the project

### Backend and AI Service Deployment (Render)

You can use the `render.yaml` file in the repository root to deploy both services at once:

1. Log in to Render
2. Go to the Dashboard and click "New" > "Blueprint"
3. Connect to your GitHub repository
4. Render will detect the `render.yaml` file and set up both services
5. Add the required environment variables for each service
6. Deploy the services

Alternatively, you can deploy each service manually:

#### Backend Service

1. Log in to Render
2. Go to the Dashboard and click "New" > "Web Service"
3. Connect to your GitHub repository
4. Set the root directory to `backend`
5. Set the build command to `npm install`
6. Set the start command to `node server.js`
7. Add the environment variables listed above
8. Deploy the service

#### AI Service

1. Log in to Render
2. Go to the Dashboard and click "New" > "Web Service"
3. Connect to your GitHub repository
4. Set the root directory to `ai`
5. Set the build command to `pip install -r requirements.txt`
6. Set the start command to `python python_service.py`
7. Add the environment variables listed above
8. Deploy the service

## Verifying Deployment

After deploying all services:

1. Visit your frontend URL to ensure the application loads
2. Test login functionality
3. Test document upload and AI features
4. Check that all API calls are working correctly

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
- Verify that the `CORS_ORIGIN` environment variables are set correctly in both backend and AI services
- Ensure the URLs include the correct protocol (https://)

### Connection Issues

If services can't connect to each other:
- Check that the environment variables for service URLs are correct
- Verify that the services are running and accessible
- Check Render logs for any connection errors

### Database Issues

If you encounter database connection problems:
- Verify your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Check that the database user has the correct permissions

## Maintenance

- Monitor your Render and Vercel dashboards for any issues
- Set up alerts for service downtime
- Regularly check logs for errors
- Update environment variables as needed when making changes to the application