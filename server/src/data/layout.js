// Static factory floor definition. Coordinates live in a 1000 x 520 SVG viewBox.
const zones = [
  { id: 'assembly',   name: 'Assembly Hall A1',     type: 'production', x: 40,  y: 40,  w: 210, h: 150, capacity: 10 },
  { id: 'welding',    name: 'Welding Bay',          type: 'hazardous',  x: 290, y: 40,  w: 170, h: 120, capacity: 6 },
  { id: 'cnc',        name: 'CNC Machining',        type: 'production', x: 500, y: 40,  w: 180, h: 120, capacity: 8 },
  { id: 'paint',      name: 'Paint Shop',           type: 'hazardous',  x: 720, y: 40,  w: 240, h: 130, capacity: 6 },
  { id: 'qc',         name: 'Quality Lab',          type: 'controlled', x: 40,  y: 330, w: 180, h: 150, capacity: 5 },
  { id: 'packaging',  name: 'Packaging Line',       type: 'production', x: 260, y: 330, w: 200, h: 150, capacity: 8 },
  { id: 'warehouse',  name: 'Warehouse',            type: 'storage',    x: 500, y: 330, w: 220, h: 150, capacity: 10 },
  { id: 'charging',   name: 'Robot Charging Dock',  type: 'robotics',   x: 760, y: 330, w: 200, h: 150, capacity: 4 }
];

const corridors = [
  [60, 262, 940, 262],
  [145, 190, 145, 262],
  [375, 160, 375, 262],
  [590, 160, 590, 262],
  [840, 170, 840, 262],
  [130, 262, 130, 330],
  [360, 262, 360, 330],
  [610, 262, 610, 330],
  [860, 262, 860, 330]
];

const hazards = [
  {
    id: 'hz-welding',
    zoneId: 'welding',
    label: 'Welding fume pocket',
    path: 'M344,96 C348,78 368,70 386,76 C404,82 412,98 404,112 C396,126 372,130 356,122 C342,115 340,106 344,96 Z'
  },
  {
    id: 'hz-paint',
    zoneId: 'paint',
    label: 'Solvent vapor pocket',
    path: 'M810,100 C814,82 836,74 854,80 C872,86 880,104 870,118 C860,132 834,134 820,126 C806,118 806,110 810,100 Z'
  }
];

const vents = [
  { id: 'v1', x: 445, y: 95,  label: 'Welding exhaust' },
  { id: 'v2', x: 665, y: 95,  label: 'CNC coolant mist extract' },
  { id: 'v3', x: 205, y: 405, label: 'Lab air handling' },
  { id: 'v4', x: 860, y: 405, label: 'Dock ventilation' }
];

const teamBases = [
  { id: 't1', x: 90,  y: 262, name: 'Response Team 1' },
  { id: 't2', x: 910, y: 262, name: 'Response Team 2' }
];

const initialWorkers = {
  assembly: 6, welding: 4, cnc: 5, paint: 3, qc: 3, packaging: 5, warehouse: 5, charging: 0
};

const initialRobots = [
  { zone: 'assembly' }, { zone: 'assembly' }, { zone: 'cnc' },
  { zone: 'packaging' }, { zone: 'warehouse' }, { zone: 'charging', state: 'charging' }
];

const workZoneIds = ['assembly', 'cnc', 'packaging', 'warehouse'];
const alertZoneIds = ['welding', 'paint'];

module.exports = { zones, corridors, hazards, vents, teamBases, initialWorkers, initialRobots, workZoneIds, alertZoneIds };
