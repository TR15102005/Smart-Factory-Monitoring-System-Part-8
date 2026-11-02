// Seed dataset for operational modules. Dates are generated relative to "now"
// so trend charts and expiry states are always meaningful.
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n, hour = 9) => {
  const d = new Date(Date.now() - n * DAY);
  d.setHours(hour, (n * 17) % 60, 0, 0);
  return d;
};
const daysAhead = (n) => new Date(Date.now() + n * DAY);

const workers = [
  { employeeId: 'EMP-1001', name: 'Ava Salazar', role: 'Cobot Operator', department: 'Assembly', zone: 'assembly', workstation: 'WS-A1', shift: 'Day', status: 'ACTIVE', lastActivity: '2026-11-02 07:42' },
  { employeeId: 'EMP-1002', name: 'Liam Chen', role: 'Line Technician', department: 'Welding', zone: 'welding', workstation: 'WS-W2', shift: 'Night', status: 'ACTIVE', lastActivity: '2026-11-02 06:58' },
  { employeeId: 'EMP-1003', name: 'Priya Sharma', role: 'Quality Inspector', department: 'Packaging', zone: 'packaging', workstation: 'WS-P1', shift: 'Day', status: 'ACTIVE', lastActivity: '2026-11-02 08:05' },
  { employeeId: 'EMP-1004', name: 'Marcus Webb', role: 'Safety Officer', department: 'Quality', zone: 'qc', workstation: 'WS-Q1', shift: 'Day', status: 'ACTIVE', lastActivity: '2026-11-02 07:31' },
  { employeeId: 'EMP-1005', name: 'Elena Petrova', role: 'Maintenance Engineer', department: 'Logistics', zone: 'warehouse', workstation: 'WS-L3', shift: 'Night', status: 'ACTIVE', lastActivity: '2026-11-02 05:47' },
  { employeeId: 'EMP-1006', name: 'Tomás Costa', role: 'Logistics Operator', department: 'Warehouse', zone: 'warehouse', workstation: 'WS-S2', shift: 'Night', status: 'ACTIVE', lastActivity: '2026-11-02 06:12' },
  { employeeId: 'EMP-1007', name: 'Yuki Tanaka', role: 'Cobot Operator', department: 'Assembly', zone: 'assembly', workstation: 'WS-A2', shift: 'Day', status: 'ACTIVE', lastActivity: '2026-11-02 08:15' },
  { employeeId: 'EMP-1008', name: 'Omar Haddad', role: 'Line Technician', department: 'Welding', zone: 'welding', workstation: 'WS-W1', shift: 'Night', status: 'TRAINING', lastActivity: '2026-11-02 04:58' },
  { employeeId: 'EMP-1009', name: 'Sofia Rossi', role: 'Quality Inspector', department: 'Packaging', zone: 'packaging', workstation: 'WS-P2', shift: 'Day', status: 'ACTIVE', lastActivity: '2026-11-02 07:58' },
  { employeeId: 'EMP-1010', name: 'David Kim', role: 'Safety Officer', department: 'Quality', zone: 'qc', workstation: 'WS-Q2', shift: 'Night', status: 'ACTIVE', lastActivity: '2026-11-02 05:24' },
  { employeeId: 'EMP-1011', name: 'Grace Okafor', role: 'Maintenance Engineer', department: 'Logistics', zone: 'charging', workstation: 'WS-L1', shift: 'Day', status: 'ACTIVE', lastActivity: '2026-11-02 08:02' },
  { employeeId: 'EMP-1012', name: 'Lucas Meyer', role: 'Cobot Operator', department: 'Assembly', zone: 'cnc', workstation: 'WS-A3', shift: 'Day', status: 'TRAINING', lastActivity: '2026-11-02 07:12' },
  { employeeId: 'EMP-1013', name: 'Maya Torres', role: 'Line Technician', department: 'Welding', zone: 'cnc', workstation: 'WS-W3', shift: 'Night', status: 'ACTIVE', lastActivity: '2026-11-02 06:36' },
  { employeeId: 'EMP-1014', name: 'Nina Novak', role: 'Paint Technician', department: 'Paint', zone: 'paint', workstation: 'WS-C1', shift: 'Day', status: 'ACTIVE', lastActivity: '2026-11-02 07:54' },
  { employeeId: 'EMP-1015', name: 'Ana Duarte', role: 'Quality Inspector', department: 'Quality', zone: 'qc', workstation: 'WS-Q3', shift: 'Day', status: 'OFFLINE', lastActivity: '2026-10-31 16:40' },
  { employeeId: 'EMP-1016', name: 'Hassan Ali', role: 'Safety Officer', department: 'Quality', zone: 'paint', workstation: 'WS-Q4', shift: 'Night', status: 'OFFLINE', lastActivity: '2026-10-31 23:12' }
];

const robots = [
  { robotId: 'RB-001', name: 'Cobot-1', model: 'Cobot', zone: 'assembly', workstation: 'WS-A1', status: 'RUNNING', battery: 84, uptimeHours: 640 },
  { robotId: 'RB-002', name: 'Cobot-2', model: 'Cobot', zone: 'assembly', workstation: 'WS-A2', status: 'RUNNING', battery: 71, uptimeHours: 512 },
  { robotId: 'RB-003', name: 'Cobot-3', model: 'Cobot', zone: 'welding', workstation: 'WS-W1', status: 'RUNNING', battery: 63, uptimeHours: 705 },
  { robotId: 'RB-004', name: 'WeldArm-1', model: 'Arm', zone: 'welding', workstation: 'WS-W2', status: 'IDLE', battery: 58, uptimeHours: 431 },
  { robotId: 'RB-005', name: 'SCARA-1', model: 'SCARA', zone: 'packaging', workstation: 'WS-P1', status: 'RUNNING', battery: 77, uptimeHours: 388 },
  { robotId: 'RB-006', name: 'SCARA-2', model: 'SCARA', zone: 'packaging', workstation: 'WS-P2', status: 'RUNNING', battery: 69, uptimeHours: 297 },
  { robotId: 'RB-007', name: 'AGV-1', model: 'AGV', zone: 'warehouse', workstation: 'WS-S1', status: 'RUNNING', battery: 52, uptimeHours: 812 },
  { robotId: 'RB-008', name: 'AGV-2', model: 'AGV', zone: 'warehouse', workstation: 'WS-S2', status: 'RUNNING', battery: 47, uptimeHours: 764 },
  { robotId: 'RB-009', name: 'Pallet-1', model: 'Palletizer', zone: 'packaging', workstation: 'WS-P3', status: 'MAINTENANCE', battery: 35, uptimeHours: 923 },
  { robotId: 'RB-010', name: 'AGV-3', model: 'AGV', zone: 'charging', workstation: 'WS-D1', status: 'CHARGING', battery: 28, uptimeHours: 556 }
];

const incidents = [
  { incidentId: 'INC-2041', zone: 'welding', type: 'abnormal condition', severity: 'HIGH', description: 'RB-003 motor temperature 78°C above configured limit 65°C', status: 'OPEN', createdAt: daysAgo(0, 7) },
  { incidentId: 'INC-2040', zone: 'packaging', type: 'comm timeout', severity: 'MEDIUM', description: 'Safety scanner heartbeat lost for 12s on SCARA-2 link', status: 'OPEN', createdAt: daysAgo(0, 6) },
  { incidentId: 'INC-2039', zone: 'cnc', type: 'e-stop triggered', severity: 'HIGH', description: 'Emergency stop activated at RB-005 during pick cycle', status: 'OPEN', createdAt: daysAgo(1, 22) },
  { incidentId: 'INC-2038', zone: 'paint', type: 'abnormal condition', severity: 'MEDIUM', description: 'VOC sensor drift detected in Paint Shop extraction line', status: 'OPEN', createdAt: daysAgo(1, 14) },
  { incidentId: 'INC-2037', zone: 'warehouse', type: 'near miss', severity: 'LOW', description: 'AGV-2 braked abruptly near pedestrian crossing marker 4', status: 'OPEN', createdAt: daysAgo(2, 10) },
  { incidentId: 'INC-2036', zone: 'assembly', type: 'comm timeout', severity: 'HIGH', description: 'Cobot-1 safety PLC link dropped 3 times within 5 minutes', status: 'OPEN', createdAt: daysAgo(2, 8) },
  { incidentId: 'INC-2035', zone: 'welding', type: 'abnormal condition', severity: 'MEDIUM', description: 'Fume extraction airflow 18% below setpoint at Welding Bay', status: 'RESOLVED', createdAt: daysAgo(3, 11), resolvedAt: daysAgo(3, 15) },
  { incidentId: 'INC-2034', zone: 'qc', type: 'near miss', severity: 'LOW', description: 'Unsecured calibration weight found on inspection bench', status: 'RESOLVED', createdAt: daysAgo(3, 9), resolvedAt: daysAgo(3, 12) },
  { incidentId: 'INC-2033', zone: 'packaging', type: 'e-stop triggered', severity: 'MEDIUM', description: 'Light curtain interrupted during SCARA-1 pallet build', status: 'RESOLVED', createdAt: daysAgo(4, 16), resolvedAt: daysAgo(4, 19) },
  { incidentId: 'INC-2032', zone: 'warehouse', type: 'abnormal condition', severity: 'LOW', description: 'AGV-1 lidar occlusion warnings in rack aisle C', status: 'RESOLVED', createdAt: daysAgo(4, 13), resolvedAt: daysAgo(4, 14) },
  { incidentId: 'INC-2031', zone: 'paint', type: 'comm timeout', severity: 'MEDIUM', description: 'Gas monitor gateway unreachable for 90s during shift change', status: 'RESOLVED', createdAt: daysAgo(5, 7), resolvedAt: daysAgo(5, 10) },
  { incidentId: 'INC-2030', zone: 'assembly', type: 'near miss', severity: 'LOW', description: 'Worker entered cobot cell without badge-in at WS-A2', status: 'RESOLVED', createdAt: daysAgo(5, 6), resolvedAt: daysAgo(5, 8) },
  { incidentId: 'INC-2029', zone: 'welding', type: 'e-stop triggered', severity: 'HIGH', description: 'E-stop pressed at weld fixture 2 during arc fault', status: 'RESOLVED', createdAt: daysAgo(6, 21), resolvedAt: daysAgo(6, 23) },
  { incidentId: 'INC-2028', zone: 'cnc', type: 'abnormal condition', severity: 'MEDIUM', description: 'Spindle vibration trend above baseline on CNC-4', status: 'RESOLVED', createdAt: daysAgo(6, 15), resolvedAt: daysAgo(6, 18) },
  { incidentId: 'INC-2027', zone: 'packaging', type: 'comm timeout', severity: 'LOW', description: 'Label printer link flaky on packaging line 2', status: 'RESOLVED', createdAt: daysAgo(7, 12), resolvedAt: daysAgo(7, 13) },
  { incidentId: 'INC-2026', zone: 'warehouse', type: 'near miss', severity: 'MEDIUM', description: 'Pallet overhang detected on AGV-2 route turn 7', status: 'RESOLVED', createdAt: daysAgo(8, 10), resolvedAt: daysAgo(8, 12) },
  { incidentId: 'INC-2025', zone: 'assembly', type: 'abnormal condition', severity: 'LOW', description: 'Torque tool calibration drift at WS-A1', status: 'RESOLVED', createdAt: daysAgo(8, 8), resolvedAt: daysAgo(8, 9) },
  { incidentId: 'INC-2024', zone: 'paint', type: 'e-stop triggered', severity: 'MEDIUM', description: 'Conveyor e-stop pulled during solvent drum transfer', status: 'RESOLVED', createdAt: daysAgo(9, 14), resolvedAt: daysAgo(9, 16) },
  { incidentId: 'INC-2023', zone: 'qc', type: 'comm timeout', severity: 'LOW', description: 'Vision station telemetry gap during audit window', status: 'RESOLVED', createdAt: daysAgo(10, 11), resolvedAt: daysAgo(10, 12) },
  { incidentId: 'INC-2022', zone: 'welding', type: 'near miss', severity: 'MEDIUM', description: 'Spatter guard found displaced at weld cell 3', status: 'RESOLVED', createdAt: daysAgo(10, 9), resolvedAt: daysAgo(10, 11) },
  { incidentId: 'INC-2021', zone: 'cnc', type: 'abnormal condition', severity: 'HIGH', description: 'Coolant leak detected under CNC-2 enclosure', status: 'RESOLVED', createdAt: daysAgo(11, 16), resolvedAt: daysAgo(11, 20) },
  { incidentId: 'INC-2020', zone: 'packaging', type: 'near miss', severity: 'LOW', description: 'Blocked emergency exit path near stretch wrapper', status: 'RESOLVED', createdAt: daysAgo(11, 13), resolvedAt: daysAgo(11, 14) },
  { incidentId: 'INC-2019', zone: 'warehouse', type: 'comm timeout', severity: 'MEDIUM', description: 'WMS handshake timeouts with AGV fleet broker', status: 'RESOLVED', createdAt: daysAgo(12, 10), resolvedAt: daysAgo(12, 12) },
  { incidentId: 'INC-2018', zone: 'assembly', type: 'e-stop triggered', severity: 'MEDIUM', description: 'Speed-and-separation monitor triggered stop at WS-A3', status: 'RESOLVED', createdAt: daysAgo(12, 8), resolvedAt: daysAgo(12, 10) },
  { incidentId: 'INC-2017', zone: 'paint', type: 'abnormal condition', severity: 'HIGH', description: 'Solvent vapor spike recorded near mixing station', status: 'RESOLVED', createdAt: daysAgo(13, 15), resolvedAt: daysAgo(13, 18) },
  { incidentId: 'INC-2016', zone: 'qc', type: 'near miss', severity: 'LOW', description: 'Trip hazard from temporary cabling at lab entrance', status: 'RESOLVED', createdAt: daysAgo(13, 9), resolvedAt: daysAgo(13, 10) }
];

const maintenance = [
  { recordId: 'MR-3001', asset: 'RB-009', type: 'CORRECTIVE', technician: 'Elena Petrova', durationHours: 6.5, notes: 'Palletizer gripper fault — replaced vacuum manifold, pending parts for full test', status: 'IN_PROGRESS', date: daysAgo(1, 8) },
  { recordId: 'MR-3002', asset: 'RB-003', type: 'PREVENTIVE', technician: 'Grace Okafor', durationHours: 2.0, notes: 'Scheduled joint lubrication and brake check', status: 'SCHEDULED', date: daysAhead(2) },
  { recordId: 'MR-3003', asset: 'RB-007', type: 'CALIBRATION', technician: 'Marcus Webb', durationHours: 1.5, notes: 'Safety lidar field recalibration after route change', status: 'SCHEDULED', date: daysAhead(4) },
  { recordId: 'MR-3004', asset: 'RB-001', type: 'PREVENTIVE', technician: 'Elena Petrova', durationHours: 3.0, notes: '500h service: gearbox oil sample taken, torque check OK', status: 'COMPLETED', date: daysAgo(3, 9) },
  { recordId: 'MR-3005', asset: 'RB-005', type: 'CORRECTIVE', technician: 'Grace Okafor', durationHours: 4.5, notes: 'Replaced faulty e-stop relay on SCARA-1 controller', status: 'COMPLETED', date: daysAgo(5, 10) },
  { recordId: 'MR-3006', asset: 'RB-008', type: 'PREVENTIVE', technician: 'Elena Petrova', durationHours: 2.5, notes: 'Battery health test and wheel tread inspection', status: 'COMPLETED', date: daysAgo(7, 9) },
  { recordId: 'MR-3007', asset: 'RB-002', type: 'CALIBRATION', technician: 'Marcus Webb', durationHours: 1.0, notes: 'TCP calibration after tool change', status: 'COMPLETED', date: daysAgo(9, 14) },
  { recordId: 'MR-3008', asset: 'RB-004', type: 'CORRECTIVE', technician: 'Grace Okafor', durationHours: 5.0, notes: 'Weld torch wire feeder jam — cleaned and load tested', status: 'COMPLETED', date: daysAgo(11, 8) },
  { recordId: 'MR-3009', asset: 'RB-006', type: 'PREVENTIVE', technician: 'Elena Petrova', durationHours: 2.0, notes: 'Belt tension and sensor cleaning', status: 'COMPLETED', date: daysAgo(13, 9) },
  { recordId: 'MR-3010', asset: 'RB-010', type: 'PREVENTIVE', technician: 'Grace Okafor', durationHours: 1.5, notes: 'Charge contact cleaning and dock alignment', status: 'COMPLETED', date: daysAgo(15, 10) },
  { recordId: 'MR-3011', asset: 'RB-003', type: 'CORRECTIVE', technician: 'Elena Petrova', durationHours: 3.5, notes: 'Cooling fan replacement after over-temperature incident', status: 'COMPLETED', date: daysAgo(17, 9) },
  { recordId: 'MR-3012', asset: 'RB-001', type: 'CALIBRATION', technician: 'Marcus Webb', durationHours: 1.0, notes: 'Force-limit validation for collaborative mode', status: 'COMPLETED', date: daysAgo(19, 13) }
];

const certifications = [
  { workerName: 'Ava Salazar', role: 'Cobot Operator', certification: 'Cobot Safety Operator', expiresAt: daysAhead(210) },
  { workerName: 'Yuki Tanaka', role: 'Cobot Operator', certification: 'Lockout/Tagout Authorized', expiresAt: daysAhead(96) },
  { workerName: 'Omar Haddad', role: 'Line Technician', certification: 'Cobot Safety Operator', expiresAt: daysAgo(12) },
  { workerName: 'Daniel Kim', role: 'Safety Officer', certification: 'Machine Guarding Awareness', expiresAt: daysAhead(24) },
  { workerName: 'Maya Torres', role: 'Line Technician', certification: 'Lockout/Tagout Authorized', expiresAt: daysAhead(150) },
  { workerName: 'Tomás Costa', role: 'Logistics Operator', certification: 'Powered Lift Truck', expiresAt: daysAhead(18) },
  { workerName: 'Priya Sharma', role: 'Quality Inspector', certification: 'First Aid / CPR', expiresAt: daysAgo(40) },
  { workerName: 'Grace Okafor', role: 'Maintenance Engineer', certification: 'Lockout/Tagout Authorized', expiresAt: daysAhead(320) }
];

const defaultSettings = {
  key: 'workspace',
  workspaceName: 'Smart Factory Monitoring',
  timezone: 'UTC',
  alertEmail: 'safety@factory.io',
  theme: 'dark',
  shiftHandover: '06:00 / 18:00'
};

const reports = [
  { reportId: 'RPT-104', title: 'Weekly Safety & Utilization Summary', workspace: 'Main Plant', from: '2026-10-20', to: '2026-10-26', createdBy: 'Marcus Webb', createdAt: daysAgo(6, 17), summary: { workers: 16, activeWorkers: 12, robots: 10, robotUtilization: 74, openIncidents: 5, compliance: 91 } },
  { reportId: 'RPT-103', title: 'Compliance Audit Pack — ISO 10218-1', workspace: 'Main Plant', from: '2026-10-01', to: '2026-10-31', createdBy: 'Factory Admin', createdAt: daysAgo(12, 11), summary: { workers: 16, activeWorkers: 13, robots: 10, robotUtilization: 69, openIncidents: 7, compliance: 88 } },
  { reportId: 'RPT-102', title: 'Robot Fleet Maintenance Log', workspace: 'Assembly Cell', from: '2026-09-15', to: '2026-10-15', createdBy: 'Grace Okafor', createdAt: daysAgo(20, 9), summary: { workers: 15, activeWorkers: 11, robots: 10, robotUtilization: 66, openIncidents: 4, compliance: 90 } },
  { reportId: 'RPT-101', title: 'Monthly Occupancy & Hazard Review', workspace: 'Main Plant', from: '2026-09-01', to: '2026-09-30', createdBy: 'Factory Admin', createdAt: daysAgo(33, 16), summary: { workers: 15, activeWorkers: 12, robots: 9, robotUtilization: 71, openIncidents: 6, compliance: 86 } }
];

module.exports = { workers, robots, incidents, maintenance, certifications, reports, defaultSettings };
