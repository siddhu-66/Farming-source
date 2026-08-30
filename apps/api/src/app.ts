import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { logger } from './config/logger';
import { errorHandler, notFound, apiLogger, securityHeaders } from './middleware';
import { formatSuccess } from './utils/formatResponse';

// Route imports
import authRoutes from './routes/auth';
import farmerRoutes from './routes/farmer';
import buyerRoutes from './routes/buyer';
import transportRoutes from './routes/transport';
import industryRoutes from './routes/industry';
import adminRoutes from './routes/admin';
import rolesRoutes from './routes/roles';
import permissionsRoutes from './routes/permissions';
import otpRoutes from './routes/otp';
import marketplaceRoutes from './routes/marketplace';
import aiRoutes from './routes/ai';
import iotRoutes from './routes/iot';
import analyticsRoutes from './routes/analytics';
import weatherRoutes from './routes/weather';
import mapsRoutes from './routes/maps';
import chatRoutes from './routes/chat';
import insuranceRoutes from './routes/insurance';
import loansRoutes from './routes/loans';
import financesRoutes from './routes/finances';
import governmentRoutes from './routes/government';
import schemeRoutes from './routes/scheme';
import uploadRoutes from './routes/upload';
import reviewsRoutes from './routes/reviews';
import ordersRoutes from './routes/orders';
import walletRoutes from './routes/wallet';
import reportsRoutes from './routes/reports';
import settingsRoutes from './routes/settings';
import securityRoutes from './routes/security';
import systemRoutes from './routes/system';
import healthRoutes from './routes/health';
import profileRoutes from './routes/profile';
import onboardingRoutes from './routes/onboarding';
import farmerOnboardingRoutes from './routes/farmerOnboarding';
import buyerOnboardingRoutes from './routes/buyerOnboarding';
import transportOnboardingRoutes from './routes/transportOnboarding';
import industryOnboardingRoutes from './routes/industryOnboarding';
import adminOnboardingRoutes from './routes/adminOnboarding';
import verificationRoutes from './routes/verification';
import dashboardRoutes from './routes/dashboard';
import navigationRoutes from './routes/navigation';
import searchRoutes from './routes/search';
import marketRoutes from './routes/market';
import notificationsRoutes from './routes/notifications';
import messagesRoutes from './routes/messages';
import calendarRoutes from './routes/calendar';
import assetsRoutes from './routes/assets';
import workersRoutes from './routes/workers';
import cropsRoutes from './routes/crops';

dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(securityHeaders);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(apiLogger);
}

// Inject IO into request object safely
app.use((req, res, next) => {
  (req as any).io = req.app.get('io');
  next();
});

// Global rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ============================================
// ROUTES
// ============================================
app.use('/health', healthRoutes);

// V1 API Routes
const v1Router = express.Router();

// Swagger Documentation
v1Router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

v1Router.use('/auth', authRoutes);
v1Router.use('/v1/auth', authRoutes);
v1Router.use('/farmer', farmerRoutes);
v1Router.use('/farmer/assets', assetsRoutes);
v1Router.use('/farmer/workers', workersRoutes);
v1Router.use('/farmer/finances', financesRoutes);
v1Router.use('/farmer/crops', cropsRoutes);
v1Router.use('/buyer', buyerRoutes);
v1Router.use('/transport', transportRoutes);
v1Router.use('/industry', industryRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/admin/roles', rolesRoutes);
v1Router.use('/admin/permissions', permissionsRoutes);
v1Router.use('/admin/otp', otpRoutes);
v1Router.use('/marketplace', marketplaceRoutes);
v1Router.use('/government', governmentRoutes);
v1Router.use('/insurance', insuranceRoutes);
v1Router.use('/loans', loansRoutes);
v1Router.use('/finances', financesRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/iot', iotRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/weather', weatherRoutes);
v1Router.use('/maps', mapsRoutes);
v1Router.use('/chat', chatRoutes);
v1Router.use('/schemes', schemeRoutes);
v1Router.use('/upload', uploadRoutes);
v1Router.use('/profile', profileRoutes);
v1Router.use('/onboarding', onboardingRoutes);
v1Router.use('/farmer/onboarding', farmerOnboardingRoutes);
v1Router.use('/buyer/onboarding', buyerOnboardingRoutes);
v1Router.use('/transport/onboarding', transportOnboardingRoutes);
v1Router.use('/industry/onboarding', industryOnboardingRoutes);
v1Router.use('/admin/onboarding', adminOnboardingRoutes);
v1Router.use('/verification', verificationRoutes);
v1Router.use('/reviews', reviewsRoutes);
v1Router.use('/orders', ordersRoutes);
v1Router.use('/wallet', walletRoutes);
v1Router.use('/reports', reportsRoutes);
v1Router.use('/admin/settings', settingsRoutes);
v1Router.use('/security', securityRoutes);
v1Router.use('/system', systemRoutes);
v1Router.use('/navigation', navigationRoutes);
v1Router.use('/search', searchRoutes);
v1Router.use('/market', marketRoutes);
v1Router.use('/notifications', notificationsRoutes);
v1Router.use('/messages', messagesRoutes);
v1Router.use('/calendar', calendarRoutes);

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1', v1Router);
app.use('/v1', v1Router);

// Fallback for old routes to point to V1 (temporary during migration)
app.use('/api', v1Router);

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFound);
app.use(errorHandler);

export default app;
