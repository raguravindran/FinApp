import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { chatRoute } from './routes/chat.js';
import { emiRoute } from './routes/emi.js';
import { healthRoute } from './routes/health.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', healthRoute);
app.post('/api/chat', chatRoute);
app.post('/api/emi/', emiRoute);

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`FinApp backend listening on http://127.0.0.1:${port}`);
});
