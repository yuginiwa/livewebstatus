# 🇵🇭 Philippines Flood Status Dashboard

A real-time dashboard monitoring flood advisories and dam water levels across the Philippines, using data from PAG-ASA.

![App Screenshot](https://imgur.com/nKWa4pM)
![App Screenshot](https://imgur.com/cXpbGTF)
***

## ✨ Features

- **Live Flood Alerts**: Fetches and displays active flood and thunderstorm warnings directly from the official PAG-ASA CAP (Common Alerting Protocol) API.
- **Dam Water Level Monitoring**: Shows the current water level (RWL), normal high water level (NHWL), and gate status for major dams in the Philippines.
- **Smart Status Indicators**: Automatically assesses and displays the status of each dam as **Normal**, **Caution**, or **Danger** based on proximity to NHWL and gate activity.
- **Enhanced Advisory Summaries**: Parses complex advisory messages to extract key phrases, evacuation notices, and a clear, actionable summary for users.
- **Auto-Refresh**: Keeps the data current by automatically fetching new information every 5 minutes, with a manual refresh option.
- **Modern & Responsive UI**: Clean, responsive interface built with React, Vite, and Tailwind CSS, providing a great experience on both desktop and mobile devices.
- **Dark Mode**: Includes support for a dark theme.

***

## ⚙️ How It Works: Automatic Updates

The dashboard is designed to be dynamic and automatically updates its data. This is managed by React's `useEffect` hook and the JavaScript `setInterval` function.

- **Initial Fetch**: When the application first loads, it immediately fetches the latest flood and dam data to ensure the dashboard is populated from the start.
- **Periodic Refresh**: A `setInterval` function is scheduled to automatically re-fetch data from all sources every 5 minutes.
- **Cleanup**: When a user navigates away from the page, a cleanup function clears the interval to prevent unnecessary background activity and memory leaks.

***

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) (with Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

***

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or later) and [pnpm](https://pnpm.io/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd your-repo-name
    ```
3.  **Install the dependencies:**
    ```sh
    pnpm install
    ```
4.  **Run the development server:**
    ```sh
    pnpm dev
    ```
    The application should now be running on `http://localhost:5173`.

***

## 📊 Data Sources

### Flood Alerts (Live Data)

- **Source**: Official PAG-ASA CAP API (`https://panahon.gov.ph/api/v1/cap-alerts`).
- **Real-time Aspect**: This provides near real-time flood and weather advisories. The data is as current as what PAG-ASA publishes to their official alert system.

### Dam Water Levels (Simulated Data)

- **Source**: The data is currently **simulated** within the `App.jsx` file.
- **Real-time Aspect**: This data is not live from an external source. It's a client-side simulation with small variations to demonstrate how the UI would behave with live data.
- **Reason for Simulation**: Direct scraping of the PAG-ASA flood information page from a browser is prevented by Cross-Origin Resource Sharing (CORS) security policies. The ideal solution for live data would be a dedicated backend proxy server to scrape the site and provide the data via a new API endpoint.

***

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
