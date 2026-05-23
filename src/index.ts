import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function bootstrap(): Promise<void> {
  try {
    app.listen(PORT, () => {
      console.log(`DevPulse API running on http://localhost:${PORT}`);
      console.log(`    Environment: ${process.env.NODE_ENV ?? 'development'}`);
    });
  } catch (error) {
    console.error('Fatal: failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
