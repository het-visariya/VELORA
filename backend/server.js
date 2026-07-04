import app from './src/app.js';
import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './src/config/env.js';

validateEnv();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\ud83d\ude80 Velora backend running on port ${PORT}`);
  console.log(`\ud83d\udce6 3D models served at /models/boy3D.fbx and /models/girl3D.fbx`);
});
