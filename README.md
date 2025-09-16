# MarkMyPDF_MERNStack

A full-stack web app that lets users upload PDFs, view them in the browser, highlight text, and persist those highlights for later use.  
Built with **React (frontend)**, **Node.js + Express (backend)**, and **MongoDB**.

## Features
- ✅ User authentication (JWT-based login/signup)
- ✅ Upload PDFs (stored locally on the server)
- ✅ View PDFs with zoom and pagination
- ✅ Highlight text in PDFs
- ✅ Save and restore highlights using PDF UUIDs
- ✅ User-specific library/dashboard (view, rename, delete PDFs)


## Tech Stack
- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Auth**: JWT
- **File Handling**: Multer (PDF upload), UUID (unique file IDs)

## Setup Instructions

1. Install Dependencies
Frontend:
```
cd client
npm install
```
Backend:
```
cd ../server
npm install
```
2. Environment Variables
Create a .env file in the server folder with values like:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/pdf_annotator
JWT_SECRET=your_jwt_secret_here
```
⚠️ .env, uploads/, and node_modules/ are ignored by git.

3. Run the App
Backend:
```
cd server
npm run dev
```
Frontend:
```
cd client
npm run dev
```
The app will run on:
+ Frontend: http://localhost:5173 (or Vite dev port)
+ Backend: http://localhost:4000

