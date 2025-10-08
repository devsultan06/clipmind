<div align="center">
  <div style="background-color: white; padding: 20px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
    <img src="public/images/logo.png" alt="ClipMind Logo" width="300" />
  </div>
  
  # 🧠 ClipMind - AI YouTube Video Summarizer
  
  > Transform any YouTube video into clear, actionable insights in seconds.
</div>

ClipMind is a modern web application that leverages AI to generate concise, human-readable summaries from YouTube videos. Simply paste a URL and get instant, intelligent summaries that save you time and help you extract key insights.

## ✨ Features

### 🎯 Core Functionality

- **Instant Summarization**: AI-powered summaries generated in seconds
- **YouTube Integration**: Support for any public YouTube video
- **Smart Insights**: Extract key points, main topics, and actionable takeaways
- **Clean Interface**: Intuitive, user-friendly design

### 📚 Library Management

- **Personal Library**: Save and organize all your video summaries
- **Advanced Search**: Find summaries by title, content, or tags
- **Filtering Options**: Sort by date, title, or relevance
- **Tag System**: Categorize summaries for easy organization

### 🔗 Sharing & Export

- **Shareable Links**: Share summaries via unique URLs (`/summary/[id]`)
- **Export Options**: Download summaries in multiple formats
- **Social Sharing**: Native sharing with Web Share API
- **Bookmark System**: Save favorite summaries for quick access

### 🔐 Privacy & Security

- **Privacy First**: No data stored without user consent
- **Secure Authentication**: User accounts for personalized experience
- **Data Control**: Full control over your summary library

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Runtime**: React 19

### Backend/API

- **Backend/API**: Next.js API routes
- **AI Model**: OpenAI via [ai-sdk](https://sdk.vercel.ai/) or direct API
- **Transcript Fetching**: [youtube-transcript](https://www.npmjs.com/package/youtube-transcript) or YouTube API
- **Authentication**: [Clerk](https://clerk.com/) for user management
- **Deployment**: [Vercel](https://vercel.com/) for seamless hosting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/clipmind.git
   cd clipmind
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 📁 Project Structure

```
clipmind/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage with input and features
│   ├── library/
│   │   └── page.tsx         # Library page with search & filtering
│   └── summary/
│       └── [summaryId]/
│           └── page.tsx     # Individual summary pages
├── public/
│   └── images/
│       └── logo.png         # ClipMind logo
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 🎨 Key Pages

### 🏠 Homepage (`/`)

- Hero section with value proposition
- YouTube URL input with AI summarization
- Feature showcase (AI-Powered, Save History, Instant Results)
- Privacy notice and user authentication

### 📚 Library (`/library`)

- Grid view of all saved summaries
- Real-time search functionality
- Sort and filter options
- Quick actions (view, share, delete)

### 📄 Summary Details (`/summary/[id]`)

- Full AI-generated summary with formatting
- Video metadata and preview
- Key points extraction
- Transcript toggle
- Share and export options

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add AI API keys, database URLs, etc.
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component reusability
- Write descriptive commit messages
- Test your changes locally

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help:

- 📧 Email: sultanabaniks@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/clipmind/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/clipmind/discussions)

---

<div align="center">
  <strong>Made with ❤️ by Sultan</strong>
</div>
