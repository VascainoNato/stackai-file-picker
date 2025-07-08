## Check yourself
- https://stackai-file-picker.vercel.app/

## Hear the Owner
- https://youtu.be/zoz44XQiHKQ

## StackAI File Picker
This is a practical frontend challenge project for Stack AI, built with React and Next.js.

## Overview
The app mimics a file system manager (like Finder on MacOS) to manage files and folders from a Google Drive connection. It allows you to:
- Read files and folders from the API by specifying the folder to list its contents (similar to ls in terminal).
- Index folders and files.
- De-index (remove) files from the indexed list (does NOT delete files from Google Drive).
- View status of files/folders: indexed, not indexed, pending, and processing.
- Prefetch folder contents on mouse hover for faster navigation.
- Cache data with SWR to improve performance on revisits.
- Filter and sort files/folders by name (A-Z, Z-A, folders first).
- Filter by type (all files, only documents, only folders).
- Filter by status.
- Search files/folders by name.
- Responsive mobile-first layout styled with TailwindCSS, inspired by Google Drive.
- Uses Lucide icons and WebP images.
- Loading skeletons and toast notifications for better UX.

## Tech Stack
- React 19
- Next.js 15
- TailwindCSS 4
- SWR for data fetching, caching, and prefetching
- Context API for global state management
- Lucide React icons
- React Hot Toast for notifications
- Custom Skeleton for loading states

## Getting Started
- To run this project locally, follow the steps below:
  
## Clone the repository:
- git clone https://github.com/VascainoNato/stackai-file-picker.git

## Navigate into the project directory:
- cd stackai-file-picker

## Install dependencies:
- npm install

## Run the development server:
- npm run dev

## Open in your browser:
- http://localhost:3000

## Disclaimer
- This project is created solely for learning and demonstration purposes. It is not intended for commercial use or production deployment. Use it responsibly and at your own risk.
