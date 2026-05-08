# AI Job Application Tracker Agent - NEXTHIRE

A modern full-stack Job Application Tracker that helps users organize, monitor, and manage their job applications efficiently. The platform allows users to track application status, store company details, manage interview progress, and receive reminders — all in one place.

---

## 🚀 Features

* Add and manage job applications
* Track application statuses
* Store company and role details
* View all applications in a clean dashboard
* Google Sheets integration for data storage
* Automated email reminders using n8n
* Responsive frontend UI
* Real-time updates between frontend and backend automation(n8n)

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

### Backend Automation

* n8n

### Database / Storage

* Google Sheets API

---

## 📂 Project Structure

```bash
Job-Tracker/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── n8n-workflows/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AyushDinda/NEXTHIRE.git
cd job-tracker-ui
```

---

## 🔧 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 🔑 Configuration

Currently, the project does not use environment variables.

The frontend directly communicates with n8n webhooks and Google Sheets workflows.

You can later add environment variables for:

* API endpoints
* Authentication
* Email services
* Deployment configurations

---

## 📊 Application Status Flow

Typical statuses used in the tracker:

* Applied
* Under Review
* Interview Scheduled
* OA Completed
* Rejected
* Offer Received

---

## 🔄 Google Sheets Integration

The application uses Google Sheets as a lightweight database.

### Features:

* Automatic data storage
* Easy manual editing
* Cloud-based access
* Simple integration with APIs

---

## 🤖 n8n Automation

n8n workflows are used for:

* Sending reminder emails
* Follow-up notifications
* Automated status checking
* Scheduled updates

---

## 🌐 Deployment

The project is currently running in local development mode.

Planned deployment platforms:

* Frontend → Render
* n8n → n8n Cloud / VPS / Railway

---

## 🧠 Future Improvements

* User authentication
* Resume upload support
* Analytics dashboard
* AI-powered job suggestions
* Calendar integration
* Dark mode
* Mobile app support

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

