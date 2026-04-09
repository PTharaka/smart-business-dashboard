# Smart Business Dashboard

A complete, full-stack predictive dashboard designed for modern business analytics. The application tracks sales/revenue, visualizes complex data using interactive charts, and features a built-in AI logic module to predict future revenue trends.

## Features
- **User Authentication**: Secure login and registration using JSON Web Tokens (JWT).
- **Interactive Dashboard**: Modern glassmorphic UI displaying real-time business KPIs and interactive charts.
- **Data Management**: Full CRUD capabilities to add, edit, or delete sales records.
- **Predictive AI Insights**: Basic ML logic forecasting next-period growth or decline based on historical sales matrices.
- **Report Export**: Export filtered reports to CSV.

## Screenshots

> *Add screenshots here after deploying*

## Live Demo
> **[🚀 Live Demo → smart-business-dashboard-lilac.vercel.app](https://smart-business-dashboard-lilac.vercel.app)**

## Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Responsive Vanilla CSS & Glassmorphism 
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Charts**: Chart.js (`react-chartjs-2`)
- **CI/CD**: GitHub Actions

## Installation
1. Clone the repository
2. In the `/server` directory run `npm install` followed by `npm run dev`
3. In the `/client` directory run `npm install` followed by `npm run dev`
4. Provide a `.env` in the `/server` root containing your `MONGO_URI` and `JWT_SECRET`.
