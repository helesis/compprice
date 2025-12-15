# 📚 CompPrice - Documentation Index

Welcome to CompPrice! A complete web scraper and dashboard system for tracking competitor hotel prices.

## 📖 Documentation Overview

### Getting Started (Start Here!)
- **[QUICKSTART.md](QUICKSTART.md)** ⭐ **START HERE**
  - 5-minute setup guide
  - Basic usage instructions
  - Common first steps

### Comprehensive Guides
- **[README.md](README.md)** - Full project documentation
  - Features overview
  - Tech stack details
  - API reference
  - Development setup

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete project layout
  - Detailed folder structure
  - Component overview
  - Technology stack table
  - File purposes

- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - How to use the application
  - Step-by-step examples
  - API testing with cURL/Postman
  - Sample data creation
  - Debugging guide
  - Testing checklist

### Reference Guides
- **[CONFIGURATION.md](CONFIGURATION.md)** - Detailed configuration
  - Environment variables
  - Database setup (Local & Cloud)
  - Scraper configuration
  - Adding new platforms
  - Performance optimization
  - Security considerations

- **[COMMANDS.md](COMMANDS.md)** - Command reference
  - All available commands
  - Backend/Frontend commands
  - Docker commands
  - Database operations
  - Testing commands
  - Quick reference table

## 🚀 Quick Navigation

### I want to...

#### Get Started
→ Read [QUICKSTART.md](QUICKSTART.md)

#### Understand the Project
→ Read [README.md](README.md) and [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

#### Set It Up
→ Follow [QUICKSTART.md](QUICKSTART.md) or [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

#### Use the Application
→ Check [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

#### Configure Settings
→ Refer to [CONFIGURATION.md](CONFIGURATION.md)

#### Find a Command
→ Look up in [COMMANDS.md](COMMANDS.md)

#### Troubleshoot Issues
→ Check [CONFIGURATION.md](CONFIGURATION.md#troubleshooting) or [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md#-debugging)

#### Add a New Feature
→ Read [CONFIGURATION.md](CONFIGURATION.md#adding-new-competitor-platforms)

## 📁 Project Structure

```
CompPrice/                      # Root directory
├── README.md                   # Main documentation
├── QUICKSTART.md               # Quick start guide
├── PROJECT_STRUCTURE.md        # Detailed structure
├── CONFIGURATION.md            # Configuration guide
├── USAGE_EXAMPLES.md           # Usage examples
├── COMMANDS.md                 # Command reference
├── (This file)                 # Documentation index
├── sample-data.json            # Sample hotel data
├── setup.sh / setup.bat        # Setup scripts
├── Dockerfile & docker-compose.yml
│
├── backend/                    # Express/Node.js backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── index.ts            # Server entry point
│       ├── models/             # MongoDB schemas
│       ├── scrapers/           # Web scrapers
│       ├── routes/             # API endpoints
│       └── utils/              # Utilities
│
└── frontend/                   # React frontend
    ├── package.json
    ├── tsconfig.json
    ├── Dockerfile
    ├── .env.example
    ├── public/index.html
    └── src/
        ├── index.tsx           # React entry point
        ├── App.tsx
        ├── components/         # Reusable components
        ├── pages/              # Page components
        ├── hooks/              # React hooks
        └── utils/              # Utilities
```

## 🎯 Feature Overview

### Dashboard
- View all tracked hotels
- Real-time price updates
- Responsive design

### Price Tracking
- Automatic hourly scraping
- Multi-platform comparison
- Historical data analysis
- Trend visualization

### Hotel Management
- Add/edit/delete hotels
- Configure competitor URLs
- Manage tracking

### API
- RESTful endpoints
- CRUD operations
- Price analytics
- Manual scraping triggers

## 💡 Key Technologies

| Component | Technology |
|-----------|-----------|
| Backend API | Express.js + TypeScript |
| Frontend UI | React 18 + TypeScript |
| Database | MongoDB |
| Web Scraping | Axios + Cheerio |
| Task Scheduling | node-cron |
| Containerization | Docker + Docker Compose |
| HTTP Client | Axios |
| Styling | CSS3 |

## 📋 Checklist for First Time Users

- [ ] Read [QUICKSTART.md](QUICKSTART.md)
- [ ] Run setup script (`./setup.sh` or `setup.bat`)
- [ ] Start MongoDB
- [ ] Start backend (`npm run dev`)
- [ ] Start frontend (`npm start`)
- [ ] Open http://localhost:3000
- [ ] Add a hotel with competitor URLs
- [ ] View price tracking
- [ ] Review [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for details

## 🆘 Troubleshooting

### Common Issues

**Q: Port already in use?**
A: See [COMMANDS.md#process-management](COMMANDS.md#process-management)

**Q: MongoDB won't connect?**
A: See [CONFIGURATION.md#mongodb-setup](CONFIGURATION.md#mongodb-setup)

**Q: CORS errors in browser?**
A: See [CONFIGURATION.md#troubleshooting](CONFIGURATION.md#troubleshooting)

**Q: Scraper not working?**
A: See [CONFIGURATION.md#troubleshooting](CONFIGURATION.md#troubleshooting)

## 📚 Learning Resources

### Backend Development
- Express.js: https://expressjs.com
- TypeScript: https://www.typescriptlang.org
- MongoDB: https://docs.mongodb.com
- node-cron: https://github.com/kelektiv/node-cron
- Cheerio: https://cheerio.js.org

### Frontend Development
- React: https://react.dev
- TypeScript in React: https://react-typescript-cheatsheet.netlify.app
- React Router: https://reactrouter.com
- Axios: https://axios-http.com

### Tools
- Git: https://git-scm.com/doc
- Docker: https://docs.docker.com
- MongoDB: https://docs.mongodb.com

## 🔑 Important Reminders

1. **Always check robots.txt** before scraping any website
2. **Respect rate limits** - add delays between requests
3. **Test locally first** before deploying to production
4. **Keep .env files private** - never commit to git
5. **Use HTTPS in production** for all API calls
6. **Add authentication** for production deployments
7. **Monitor logs** for errors and performance issues

## 🎓 Project Structure Philosophy

This project is organized to:
- ✅ Be easy to understand and navigate
- ✅ Follow industry best practices
- ✅ Support easy feature additions
- ✅ Facilitate team collaboration
- ✅ Enable production deployment
- ✅ Provide comprehensive documentation

## 🚀 Next Steps

1. **Fresh Start?** → Go to [QUICKSTART.md](QUICKSTART.md)
2. **Ready to Code?** → Check [CONFIGURATION.md](CONFIGURATION.md#adding-new-competitor-platforms)
3. **Need Help?** → Search relevant documentation above
4. **Found an Issue?** → Refer to [COMMANDS.md](COMMANDS.md#-debugging)

## 📞 Support

If you can't find what you're looking for:

1. Check the relevant documentation file above
2. Search using Ctrl+F in the documentation
3. Review [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for practical examples
4. Check logs in `backend/error.log`
5. Review browser console (F12) for frontend errors

## 📄 File Purposes

| File | Purpose |
|------|---------|
| README.md | Full documentation with features, setup, API reference |
| QUICKSTART.md | 5-minute setup and basic usage |
| PROJECT_STRUCTURE.md | Detailed project layout and structure |
| CONFIGURATION.md | Environment variables, setup, advanced config |
| USAGE_EXAMPLES.md | Practical examples, API testing, debugging |
| COMMANDS.md | All available commands and quick reference |
| sample-data.json | Example hotel data for testing |
| setup.sh/setup.bat | Automated installation scripts |
| Dockerfile | Container image for production |
| docker-compose.yml | Multi-container orchestration |

## 🎉 You're Ready!

Choose your starting point:
- 🟢 **New to the project?** Start with [QUICKSTART.md](QUICKSTART.md)
- 🔵 **Want complete details?** Read [README.md](README.md)
- 🟡 **Need to configure?** Check [CONFIGURATION.md](CONFIGURATION.md)
- 🔴 **Looking for commands?** See [COMMANDS.md](COMMANDS.md)

---

**Happy coding!** 🚀 Let's track some hotel prices!
