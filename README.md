# File Assistant

A modern, responsive chat interface for processing files with natural language instructions. This application resembles ChatGPT's interface but is focused on file operations.

## Features

- Upload one or more files (PDFs, images, text files, etc.)
- Chat-like interface for requesting file operations
- Drag and drop file support
- Fully responsive design for all screen sizes
- Modern UI with smooth animations
- Processes files directly in the browser

## Technologies Used

- React 19
- TypeScript
- Tailwind CSS
- Vite
- Framer Motion

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Building

```bash
# Build for production
npm run build
```

The built files will be in the `dist` directory.

## Usage Instructions

1. Click the upload button or drag files into the chat area
2. Type a natural language instruction like:
   - "Compress this image"
   - "Convert this file to PDF"
   - "Extract text from this document"
3. Press Enter or click the send button
4. View the response in the chat interface

## Project Structure

- `src/components/` - React components
- `src/App.tsx` - Main application component
- `public/` - Static assets

## Responsive Design

The application is fully responsive and optimized for:

- Desktop computers
- Tablets
- Mobile devices

The interface adapts to different screen sizes while maintaining usability and visual appeal.

## License

MIT

# File-Assist Backend

A Flask application for file operations including PDF compression, splitting, merging, and image compression.

## Deploy to Render (Free)

1. Create a Render account at https://render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - Name: file-assist-backend (or your preferred name)
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn backend.FYP.app:app`
   - Plan: Free

Your application will be deployed at a URL like `https://file-assist-backend.onrender.com`

## Local Development

1. Install dependencies: `pip install -r requirements.txt`
2. Run the application: `python backend/FYP/app.py`
3. The server will start at `http://localhost:5000`
