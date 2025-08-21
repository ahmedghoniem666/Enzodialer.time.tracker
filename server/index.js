import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// auth middleware
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// register (for testing)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role='agent' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing' });
    const hash = await bcrypt.hash(password, 10);
    const u = await prisma.user.create({ data: { name, email, password: hash, role }});
    res.json({ ok:true, id: u.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid' });
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role }});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// start shift
app.post('/api/start-shift', auth, async (req, res) => {
  try {
    const shift = await prisma.shift.create({ data: { userId: req.user.userId, startAt: new Date() }});
    res.json({ ok:true, shiftId: shift.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// end shift
app.post('/api/end-shift', auth, async (req, res) => {
  try {
    const { shiftId } = req.body;
    if (!shiftId) return res.status(400).json({ error: 'Missing shiftId' });
    const shift = await prisma.shift.findUnique({ where: { id: shiftId }});
    if (!shift) return res.status(404).json({ error: 'Not found' });
    const endAt = new Date();
    const totalSeconds = Math.round((endAt - shift.startAt) / 1000);
    await prisma.shift.update({ where: { id: shiftId }, data: { endAt, totalSeconds }});
    res.json({ ok:true, totalSeconds });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// activity
app.post('/api/activity', auth, async (req, res) => {
  try {
    const { shiftId, type, payload } = req.body;
    await prisma.activity.create({ data: { userId: req.user.userId, shiftId: shiftId || null, type: type || 'heartbeat', payload }});
    // check blacklist
    const settings = await prisma.setting.findFirst();
    const blacklisted = settings?.blacklistedDomains || [];
    if (type === 'tab' && payload?.url) {
      const url = payload.url;
      const matched = blacklisted.find(d => url.includes(d));
      if (matched) {
        await prisma.incident.create({ data: { userId: req.user.userId, shiftId: shiftId || null, reason: 'blacklisted_url', details: { url } }});
      }
    }
    res.json({ ok:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// incidents (manager)
app.get('/api/incidents', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const incidents = await prisma.incident.findMany({ orderBy: { timestamp: 'desc' }, take: 500 });
    res.json({ incidents });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// shifts for user
app.get('/api/shifts/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.userId !== req.params.userId) return res.status(403).json({ error: 'forbidden' });
    const list = await prisma.shift.findMany({ where: { userId: req.params.userId }, orderBy: { startAt: 'desc' }, take: 200 });
    res.json({ list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// settings (admin)
app.post('/api/settings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const body = req.body;
    const existing = await prisma.setting.findFirst();
    if (existing) {
      await prisma.setting.update({ where: { id: existing.id }, data: body });
    } else {
      await prisma.setting.create({ data: body });
    }
    res.json({ ok:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/_health', (req, res) => res.json({ ok:true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on', PORT));
