import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import 'dotenv/config';
import { fastify, type FastifyInstance } from "fastify";
import fastifyJwt from "fastify-jwt";
import fastifyRawBody from 'fastify-raw-body';
import fastifyMultipart from '@fastify/multipart';
import { JobDailyQuestion } from './jobs/daily-question';
import { JobWeeklyChallenge } from './jobs/weekly-challenge';
import { errorHandler } from './middlewares/error-handler';
import { authRoutes } from './routes/authRoutes';
import { challengeRoutes } from './routes/challenge-routes';
import { checkoutRoutes } from './routes/checkoutRoutes';
import { coupleInviteRoutes } from './routes/couple-invite-routes';
import { coupleRoutes } from './routes/coupleRoutes';
import { questionsRoutes } from './routes/question-routes';
import { signalRoutes } from './routes/signalRoutes';
import { userRoutes } from './routes/userRoutes';
import { webhookRoutes } from './routes/webhookRoutes';
import { uploadRoutes } from './routes/uploadRoutes';

const app: FastifyInstance = fastify();

app.register(fastifyJwt, {
  secret: process.env.SECRET_KEY as string,
  sign: {
    expiresIn: '1d',
  },
});

app.setErrorHandler(errorHandler);
app.register(fastifyCors);
app.register(fastifyFormbody);
app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
app.register(fastifyRawBody, {
  field: 'rawBody',
  encoding: 'utf-8',
});

app.register(authRoutes, { prefix: 'auth' });
app.register(userRoutes);
app.register(checkoutRoutes);
app.register(coupleInviteRoutes);
app.register(coupleRoutes);
app.register(signalRoutes);
app.register(uploadRoutes);
app.register(webhookRoutes, { prefix: 'data' });
app.register(questionsRoutes)
app.register(challengeRoutes)

const dailyQuestionJob = new JobDailyQuestion(app);
const jobWeeklyChallenge = new JobWeeklyChallenge(app);
dailyQuestionJob.start();
jobWeeklyChallenge.start();

const PORT = Number(process.env.PORT) || 3000;
app.listen({ port: PORT }, () => console.log(`listening on port ${PORT}`));
