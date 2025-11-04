# Gym Management System - Frontend

A modern, responsive frontend for the Gym Management System built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🏠 Dashboard
- **Analytics Cards**: Total members, active members, monthly revenue, expiring subscriptions
- **Quick Stats**: Gender distribution, plan statistics, paused subscriptions
- **Quick Actions**: Add member, new subscription, view reports, manage scheduler
- **Real-time Updates**: Auto-refresh every 5 minutes

### 👥 Member Management
- **CRUD Operations**: Create, read, update, delete members
- **Advanced Filtering**: By status, gender, search by name/email/phone
- **Member Details**: Personal info, physical stats, gym preferences
- **Status Management**: Active, inactive, suspended members

### 📋 Plan Management
- **Plan Creation**: Flexible duration, pricing, pause days configuration
- **Visual Plan Cards**: Color-coded by duration, clear pricing display
- **Active/Inactive Toggle**: Easy plan status management
- **Pricing Calculator**: Auto-calculation of total fees

### 📝 Subscription Management
- **Subscription Tracking**: Start/end dates, payment details, status
- **Pause/Resume Functionality**: One-click pause and resume with reason tracking
- **Progress Indicators**: Visual pause days usage with progress bars
- **Status Filtering**: Active, paused, expired subscriptions

### 📊 Analytics & Reports
- **Revenue Analytics**: Monthly comparison with growth indicators
- **Member Demographics**: Gender and status distribution
- **Plan Popularity**: Visual representation of plan usage
- **Expiring Alerts**: Upcoming subscription expirations

### ⚙️ Scheduler Management
- **Status Monitoring**: Real-time scheduler health check
- **Manual Triggers**: On-demand auto-resume execution
- **Result Tracking**: Success/failure statistics
- **Health Alerts**: Notifications when scheduler is down

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#1E40AF` - Trust, reliability
- **Success Green**: `#059669` - Growth, health
- **Warning Orange**: `#EA580C` - Attention needed
- **Danger Red**: `#DC2626` - Urgent actions
- **Premium Purple**: `#7C3AED` - VIP features
- **Info Teal**: `#0D9488` - Neutral information

### Status Colors
- **Active**: Green - Good to go
- **Paused**: Orange - Temporarily stopped
- **Expired**: Red - Problem/expired
- **Inactive**: Gray - Not in use

### Typography
- **Font**: Inter (clean, modern, readable)
- **Hierarchy**: Clear font sizes and weights
- **Accessibility**: High contrast ratios

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Code Quality**: Biome (linting & formatting)
- **Authentication**: JWT-based with context
- **State Management**: React hooks and context
- **API Integration**: Fetch with custom wrapper

## 📱 Responsive Design

### Mobile-First Approach
- **Bottom Navigation**: Easy thumb navigation on mobile
- **Touch Targets**: Minimum 44px for accessibility
- **Swipe Gestures**: Future enhancement for card actions
- **Optimized Layouts**: Grid systems adapt to screen size

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running backend API at `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-management-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Default Login Credentials
- **Username**: `admin`
- **Password**: `password123`

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── members/           # Member management
│   ├── plans/             # Plan management
│   ├── subscriptions/     # Subscription management
│   ├── analytics/         # Analytics & reports
│   ├── scheduler/         # Scheduler management
│   ├── login/             # Authentication
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects)
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components
│   └── auth/              # Authentication components
├── lib/                   # Utilities and configurations
│   ├── api.ts             # API client and endpoints
│   ├── types.ts           # TypeScript type definitions
│   └── auth-context.tsx   # Authentication context
└── public/                # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## 🔐 Authentication

The app uses JWT-based authentication:

1. **Login Flow**: Username/password → JWT token → localStorage
2. **Protected Routes**: All pages except login require authentication
3. **Token Management**: Automatic token validation and redirect
4. **Logout**: Clears token and redirects to login

## 📡 API Integration

### Base Configuration
- **Base URL**: Configurable via environment variables
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Consistent error responses with user feedback
- **Loading States**: Visual indicators for all async operations

### API Endpoints
- **Auth**: `/auth/login`
- **Members**: `/members/*`
- **Plans**: `/plans/*`
- **Subscriptions**: `/subscriptions/*`
- **Analytics**: `/analytics/*`
- **Scheduler**: `/scheduler/*`

## 🎯 Key Features Implementation

### Dashboard Cards
- Real-time data from `/analytics/summary`
- Color-coded by importance and status
- Hover effects and animations
- Mobile-responsive grid layout

### Member Management
- Comprehensive CRUD operations
- Advanced search and filtering
- Status badges and indicators
- Responsive table with actions

### Subscription Pause/Resume
- One-click pause with reason tracking
- Visual progress bars for pause days
- Automatic end date calculation
- Status-based action availability

### Scheduler Integration
- Real-time status monitoring
- Manual trigger capability
- Result tracking and display
- Health alerts and notifications

## 🔄 Auto-Refresh & Real-time Updates

- **Dashboard**: Auto-refreshes every 5 minutes
- **Manual Refresh**: Available on all data tables
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Automatic retry mechanisms

## 🎨 UI/UX Best Practices

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant
- **Focus Management**: Clear focus indicators

### Performance
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components and routes
- **Caching**: API response caching

### User Experience
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Feedback**: Success/error notifications
- **Progressive Enhancement**: Works without JavaScript

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables for Production
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

### Deployment Platforms
- **Vercel**: Recommended (zero-config)
- **Netlify**: Static site hosting
- **Docker**: Containerized deployment
- **Traditional Hosting**: Build and serve static files

## 🔮 Future Enhancements

### Planned Features
- **Charts & Graphs**: Revenue trends, member growth
- **Notifications**: Real-time alerts and updates
- **Dark Mode**: Theme switching capability
- **Offline Support**: PWA with service workers
- **Export Features**: PDF reports, CSV exports
- **Advanced Filters**: Date ranges, custom queries
- **Bulk Operations**: Multi-select actions
- **Member Photos**: Profile picture uploads

### Technical Improvements
- **State Management**: Redux Toolkit or Zustand
- **Testing**: Jest, React Testing Library
- **Storybook**: Component documentation
- **Performance**: Bundle analysis and optimization
- **Monitoring**: Error tracking and analytics

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend is running on correct port
   - Verify NEXT_PUBLIC_API_URL in .env.local
   - Check network connectivity

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Verify credentials with backend team
   - Check token expiration (30 days)

3. **Build Errors**
   - Clear .next folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run lint`

### Development Tips
- Use browser dev tools for API debugging
- Check console for error messages
- Verify environment variables are loaded
- Test with different screen sizes

## 📄 License

This project is part of the Gym Management System and is proprietary software.

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper error handling
4. Test on mobile devices
5. Update documentation for new features

## 📞 Support

For technical support or questions:
- Check the API documentation in `/frontend` folder
- Review the component documentation
- Contact the development team

---

Built with ❤️ for gym owners who want to focus on fitness, not paperwork.