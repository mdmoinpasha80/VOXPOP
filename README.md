# VOXPOP - QuickPoll Live

VOXPOP is a real-time-like polling application that allows users to create polls, vote on them, and see live results with vibrant visualizations.

## 🚀 Features

- **Create Polls**: Quickly launch a poll with a question and 2-4 options.
- **Vote & View Results**: Instant feedback with animated progress bars and percentage calculations.
- **Real-time Feel**: Results update immediately after voting.
- **Poll Management**: Sidebar navigation to switch between active polls and a delete function for management.
- **Vibrant Design**: A bold, modern interface using Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Framer Motion (motion).
- **Backend**: Node.js, Express (custom server).
- **Runtime**: TypeScript.

## 💻 Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository** (or download the ZIP):
   ```bash
   git clone <https://github.com/mdmoinpasha80/VOXPOP>
   cd voxpop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file based on `.env.example` (though for local development without Gemini AI features, this is optional for the core polling functionality).

### Running the App

Start the development server (runs both the Express API and Vite):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.


📁 Project Structure
voxpop/
├── 📁 src/                     # Frontend React source code
│   ├── App.tsx                 # Main application logic and UI
│   ├── index.css               # Global styles and Tailwind setup
│   └── main.tsx                # React entry point
├── 📄 .gitignore               # Files and folders ignored by Git
├── 📄 index.html               # Root HTML file
├── 📄 metadata.json            # App metadata (name, description)
├── 📄 package.json             # Project dependencies and scripts
├── 📄 README.md                # Project documentation
├── 📄 server.ts                # Backend server (Express API)
├── 📄 tsconfig.json            # TypeScript configuration
└── 📄 vite.config.ts           # Vite build configuration

