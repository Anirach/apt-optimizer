import db, { generateUUID, getCurrentDateTime, initializeDatabase } from './index.js';
import { hashPassword } from '../utils/password.js';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Initialize schema first
  initializeDatabase();

  const now = getCurrentDateTime();

  // Create Locations
  console.log('Creating locations...');
  const mainClinicId = generateUUID();
  const eastWingId = generateUUID();

  const locationStmt = db.prepare(`
    INSERT INTO Location (id, name, building, floor, room, addressProvince, addressPostal, addressCountry, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  locationStmt.run(
    mainClinicId,
    'Main Clinic',
    'Building A',
    '1',
    '101-105',
    'Bangkok',
    '10110',
    'Thailand',
    now,
    now
  );

  locationStmt.run(
    eastWingId,
    'East Wing',
    'Building B',
    '2',
    '201-210',
    'Bangkok',
    '10110',
    'Thailand',
    now,
    now
  );

  console.log('✅ Created 2 locations\n');

  // Create Departments
  console.log('Creating departments...');
  const orthoId = generateUUID();
  const cardioId = generateUUID();
  const generalId = generateUUID();

  const deptStmt = db.prepare(`
    INSERT INTO Department (id, name, code, description, locationId, defaultAppointmentDuration, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  deptStmt.run(
    orthoId,
    'Orthopedics',
    'ORTHO',
    'Bone, joint, and muscle care',
    mainClinicId,
    30,
    1,
    now,
    now
  );

  deptStmt.run(
    cardioId,
    'Cardiology',
    'CARDIO',
    'Heart and cardiovascular care',
    mainClinicId,
    45,
    1,
    now,
    now
  );

  deptStmt.run(
    generalId,
    'General Medicine',
    'GENERAL',
    'Primary care and general health',
    eastWingId,
    20,
    1,
    now,
    now
  );

  console.log('✅ Created 3 departments\n');

  // Create Admin User
  console.log('Creating admin user...');
  const adminId = generateUUID();
  const adminPassword = await hashPassword('password123');

  const userStmt = db.prepare(`
    INSERT INTO User (id, email, password, role, firstName, lastName, phone, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  userStmt.run(
    adminId,
    'admin@hospital.com',
    adminPassword,
    'admin',
    'Admin',
    'User',
    '0812345678',
    now,
    now
  );

  console.log('✅ Created admin user (admin@hospital.com / password123)\n');

  // Create Provider User
  console.log('Creating provider...');
  const providerUserId = generateUUID();
  const providerId = generateUUID();
  const providerPassword = await hashPassword('password123');

  userStmt.run(
    providerUserId,
    'sarah.chen@hospital.com',
    providerPassword,
    'provider',
    'Sarah',
    'Chen',
    '0823456789',
    now,
    now
  );

  const providerStmt = db.prepare(`
    INSERT INTO Provider (id, userId, firstName, lastName, title, specialties, departments, licenseNumber, email, phone, bio, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  providerStmt.run(
    providerId,
    providerUserId,
    'Sarah',
    'Chen',
    'Dr.',
    JSON.stringify(['Orthopedics', 'Sports Medicine']),
    JSON.stringify([orthoId]),
    'MD-12345',
    'sarah.chen@hospital.com',
    '0823456789',
    'Specialist in orthopedic surgery with 10 years of experience',
    1,
    now,
    now
  );

  console.log('✅ Created provider (sarah.chen@hospital.com / password123)\n');

  // Create Sample Patient
  console.log('Creating sample patient...');
  const patientUserId = generateUUID();
  const patientId = generateUUID();
  const patientPassword = await hashPassword('password123');

  userStmt.run(
    patientUserId,
    'john.doe@email.com',
    patientPassword,
    'patient',
    'John',
    'Doe',
    '0834567890',
    now,
    now
  );

  const patientStmt = db.prepare(`
    INSERT INTO Patient (id, userId, firstName, lastName, dateOfBirth, gender, phone, email, pdpaConsent, pdpaConsentDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  patientStmt.run(
    patientId,
    patientUserId,
    'John',
    'Doe',
    '1990-05-15',
    'male',
    '0834567890',
    'john.doe@email.com',
    1,
    now,
    now,
    now
  );

  console.log('✅ Created sample patient (john.doe@email.com / password123)\n');

  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📝 Summary:');
  console.log('   - 2 Locations');
  console.log('   - 3 Departments');
  console.log('   - 1 Admin user');
  console.log('   - 1 Provider');
  console.log('   - 1 Patient');
  console.log('\n🔐 Default credentials:');
  console.log('   Admin: admin@hospital.com / password123');
  console.log('   Provider: sarah.chen@hospital.com / password123');
  console.log('   Patient: john.doe@email.com / password123\n');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    db.close();
  });
