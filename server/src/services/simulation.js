// Live floor simulation driven by worker/robot records: entities move between
// zones, batteries drain and recharge, gas alerts raise and dispatch response
// teams. The React client polls /api/zones/live for this state.
const layout = require('../data/layout');

const TICK_MS = 2000;
const zoneById = Object.fromEntries(layout.zones.map((z) => [z.id, z]));

let workers = [];
let robots = [];
let teams = [];
let alerts = [];
let resolved = [];
let timer = null;
let alertSeq = 0;

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const STATE_FROM_STATUS = { RUNNING: 'working', IDLE: 'idle', CHARGING: 'charging', MAINTENANCE: 'maintenance' };
const STATUS_FROM_STATE = { working: 'RUNNING', idle: 'IDLE', charging: 'CHARGING', maintenance: 'MAINTENANCE' };

function pointIn(zoneId, margin = 16) {
  const z = zoneById[zoneId];
  return { x: Math.round(rand(z.x + margin, z.x + z.w - margin)), y: Math.round(rand(z.y + margin, z.y + z.h - margin)) };
}

function inRect(p, z) {
  return p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h;
}

function zoneAt(p) {
  const found = layout.zones.find((z) => inRect(p, z));
  return found ? found.id : null;
}

function stepTowards(entity, speed) {
  const dx = entity.tx - entity.x;
  const dy = entity.ty - entity.y;
  const dist = Math.hypot(dx, dy);
  if (dist < speed) {
    entity.x = entity.tx;
    entity.y = entity.ty;
    return true;
  }
  entity.x = Math.round(entity.x + (dx / dist) * speed);
  entity.y = Math.round(entity.y + (dy / dist) * speed);
  return false;
}

function makeWorker(doc) {
  const zone = zoneById[doc.zone] ? doc.zone : 'assembly';
  const p = pointIn(zone);
  return { id: doc.id, zone, x: p.x, y: p.y, tx: p.x, ty: p.y };
}

function makeRobot(doc) {
  const zone = zoneById[doc.zone] ? doc.zone : 'charging';
  const p = pointIn(zone);
  return {
    id: doc.id,
    zone,
    state: STATE_FROM_STATUS[doc.status] || 'idle',
    battery: typeof doc.battery === 'number' ? doc.battery : 80,
    task: Math.round(rand(30, 90)),
    x: p.x, y: p.y, tx: p.x, ty: p.y
  };
}

function init(workerDocs, robotDocs) {
  workers = workerDocs.filter((w) => w.status === 'ACTIVE' || w.status === 'TRAINING').map(makeWorker);
  robots = robotDocs.map(makeRobot);
  teams = layout.teamBases.map((t) => ({
    id: t.id, name: t.name, x: t.x, y: t.y, tx: t.x, ty: t.y,
    base: { x: t.x, y: t.y }, status: 'standby', alertId: null
  }));
  alerts = [];
  resolved = [];
}

/* live record management (called by routes after DB writes) */
function addWorker(doc) {
  if (!workers.some((w) => w.id === doc.id)) workers.push(makeWorker(doc));
}
function removeWorker(id) {
  workers = workers.filter((w) => w.id !== id);
}
function setWorkerZone(id, zone) {
  const w = workers.find((x) => x.id === id);
  if (w && zoneById[zone]) {
    w.zone = zone;
    const p = pointIn(zone);
    w.tx = p.x; w.ty = p.y;
  }
}
function addRobot(doc) {
  if (!robots.some((r) => r.id === doc.id)) robots.push(makeRobot(doc));
}
function setRobot(id, patch) {
  const r = robots.find((x) => x.id === id);
  if (!r) return;
  if (patch.state) r.state = patch.state;
  if (patch.zone && zoneById[patch.zone]) {
    r.zone = patch.zone;
    const p = pointIn(patch.zone);
    r.tx = p.x; r.ty = p.y;
  }
}

function tickWorkers() {
  for (const w of workers) {
    const arrived = stepTowards(w, Math.round(rand(9, 15)));
    if (arrived) {
      if (Math.random() < 0.04) w.zone = pick(layout.zones).id;
      const target = pointIn(w.zone);
      w.tx = target.x;
      w.ty = target.y;
    }
  }
}

function tickRobots() {
  for (const r of robots) {
    if (r.state === 'maintenance') continue;

    if (r.state === 'charging') {
      r.battery = Math.min(100, r.battery + 1.4);
      if (r.battery >= 95) {
        r.state = 'working';
        r.zone = pick(layout.workZoneIds);
        const t = pointIn(r.zone);
        r.tx = t.x; r.ty = t.y;
      }
      continue;
    }
    if (r.state === 'idle') {
      r.battery = Math.max(0, r.battery - 0.05);
      if (Math.random() < 0.35) r.state = 'working';
      continue;
    }

    r.battery = Math.max(0, r.battery - 0.12);
    r.task = Math.min(98, Math.max(15, r.task + Math.round(rand(-6, 6))));
    const arrived = stepTowards(r, Math.round(rand(8, 12)));
    if (arrived) {
      const roll = Math.random();
      if (r.battery < 18 || roll < 0.02) {
        r.state = 'charging';
        r.zone = 'charging';
        const t = pointIn('charging');
        r.tx = t.x; r.ty = t.y;
      } else if (roll < 0.06) {
        r.state = 'idle';
      } else if (roll < 0.14) {
        r.zone = pick(layout.workZoneIds);
        const t = pointIn(r.zone);
        r.tx = t.x; r.ty = t.y;
      } else {
        const t = pointIn(r.zone);
        r.tx = t.x; r.ty = t.y;
      }
    }
  }
}

function tickAlerts() {
  const now = Date.now();
  alerts = alerts.filter((a) => {
    if (now < a.expiresAt) return true;
    resolved.unshift({ ...a, resolvedAt: now });
    resolved = resolved.slice(0, 8);
    teams.forEach((t) => {
      if (t.alertId === a.id) {
        t.status = 'standby';
        t.alertId = null;
        t.tx = t.base.x;
        t.ty = t.base.y;
      }
    });
    return false;
  });

  if (alerts.length < 2 && Math.random() < 0.07) {
    const zoneId = pick(layout.alertZoneIds);
    const z = zoneById[zoneId];
    const severity = Math.random() < 0.4 ? 'high' : 'medium';
    const alert = {
      id: `a${++alertSeq}`,
      zoneId,
      x: Math.round(z.x + z.w / 2 + rand(-18, 18)),
      y: Math.round(z.y + z.h / 2 + rand(-12, 12)),
      severity,
      message: severity === 'high' ? 'Gas concentration above threshold' : 'Gas leak suspected',
      startedAt: now,
      expiresAt: now + Math.round(rand(20000, 38000))
    };
    alerts.push(alert);

    const standby = teams.filter((t) => t.status === 'standby');
    if (standby.length) {
      const team = standby.sort((a, b) => Math.hypot(a.x - alert.x, a.y - alert.y) - Math.hypot(b.x - alert.x, b.y - alert.y))[0];
      team.status = 'dispatched';
      team.alertId = alert.id;
      team.tx = alert.x;
      team.ty = Math.min(alert.y + 20, 500);
    }
  }
}

function tickTeams() {
  for (const t of teams) stepTowards(t, 16);
}

function tick() {
  tickWorkers();
  tickRobots();
  tickAlerts();
  tickTeams();
}

function snapshot() {
  const zones = layout.zones.map((z) => {
    const workersIn = workers.filter((w) => inRect(w, z)).length;
    const robotsIn = robots.filter((r) => r.state !== 'maintenance' && inRect(r, z)).length;
    const zoneAlerts = alerts.filter((a) => a.zoneId === z.id);
    let status = 'ok';
    if (zoneAlerts.length) status = 'alert';
    else if (workersIn > z.capacity) status = 'over';
    else if (workersIn >= z.capacity * 0.7) status = 'busy';
    return {
      ...z,
      workers: workersIn,
      robots: robotsIn,
      alerts: zoneAlerts.map((a) => a.id),
      status,
      utilization: Math.round((workersIn / z.capacity) * 100)
    };
  });

  const compliant = zones.filter((z) => z.status === 'ok' || z.status === 'busy').length;
  const robotsActive = robots.filter((r) => r.state === 'working').length;

  return {
    ts: Date.now(),
    summary: {
      workers: workers.length,
      robotsTotal: robots.length,
      robotsActive,
      robotUtilization: Math.round((robotsActive / robots.length) * 100),
      activeAlerts: alerts.length,
      compliance: Math.round((compliant / zones.length) * 100)
    },
    zones,
    workers: workers.map(({ id, x, y }) => ({ id, x, y, zone: zoneAt({ x, y }) })),
    robots: robots.map(({ id, x, y, state, battery, task }) => ({ id, x, y, state, battery: Math.round(battery), task, zone: zoneAt({ x, y }) })),
    alerts,
    resolved,
    teams,
    hazards: layout.hazards,
    vents: layout.vents,
    corridors: layout.corridors
  };
}

function start(workerDocs, robotDocs) {
  if (timer) return;
  init(workerDocs || [], robotDocs || []);
  tick();
  timer = setInterval(tick, TICK_MS);
  console.log(`[sim] live floor simulation started (tick 2s, ${workers.length} workers, ${robots.length} robots)`);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { start, stop, snapshot, addWorker, removeWorker, setWorkerZone, addRobot, setRobot, STATUS_FROM_STATE };
