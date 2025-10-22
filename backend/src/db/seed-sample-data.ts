import db, { generateUUID, getCurrentDateTime } from '../db/index.js';
import { hashPassword } from '../utils/password.js';

async function seedSampleData() {
  console.log('🌱 Adding sample data for frontend testing...\n');

  const now = getCurrentDateTime();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get existing data
  const locations = db.prepare('SELECT * FROM Location').all() as any[];
  const departments = db.prepare('SELECT * FROM Department').all() as any[];
  const providers = db.prepare('SELECT * FROM Provider').all() as any[];
  const patients = db.prepare('SELECT * FROM Patient').all() as any[];

  if (locations.length === 0 || departments.length === 0 || providers.length === 0) {
    console.log('❌ Please run npm run db:seed first to create base data');
    return;
  }

  const mainLocation = locations[0];
  const orthoDept = departments.find((d: any) => d.code === 'ORTHO');
  const cardioDept = departments.find((d: any) => d.code === 'CARDIO');
  const provider = providers[0];
  const patient = patients[0];

  console.log('Creating time slots...');

  // Create time slots for today and tomorrow
  const slots = [];
  for (let day = 0; day < 2; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    // Create morning slots (9 AM - 12 PM)
    for (let hour = 9; hour < 12; hour++) {
      const slotId = generateUUID();
      const startTime = `${dateStr}T${hour.toString().padStart(2, '0')}:00:00.000Z`;
      const endTime = `${dateStr}T${hour.toString().padStart(2, '0')}:30:00.000Z`;

      db.prepare(`
        INSERT INTO TimeSlot (id, providerId, departmentId, locationId, startTime, endTime, duration, capacity, isAvailable, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        slotId,
        provider.id,
        orthoDept.id,
        mainLocation.id,
        startTime,
        endTime,
        30,
        1,
        1,
        now,
        now
      );

      slots.push({ id: slotId, startTime, endTime });
    }

    // Create afternoon slots (2 PM - 5 PM)
    for (let hour = 14; hour < 17; hour++) {
      const slotId = generateUUID();
      const startTime = `${dateStr}T${hour.toString().padStart(2, '0')}:00:00.000Z`;
      const endTime = `${dateStr}T${hour.toString().padStart(2, '0')}:30:00.000Z`;

      db.prepare(`
        INSERT INTO TimeSlot (id, providerId, departmentId, locationId, startTime, endTime, duration, capacity, isAvailable, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        slotId,
        provider.id,
        orthoDept.id,
        mainLocation.id,
        startTime,
        endTime,
        30,
        1,
        1,
        now,
        now
      );

      slots.push({ id: slotId, startTime, endTime });
    }
  }

  console.log(`✅ Created ${slots.length} time slots\n`);

  console.log('Creating appointments...');

  // Create some today's appointments with different statuses
  const todaySlots = slots.filter(s => s.startTime.startsWith(today.toISOString().split('T')[0])).slice(0, 4);
  const statuses = ['scheduled', 'checked_in', 'completed', 'scheduled'];
  const risks = ['low', 'medium', 'high', 'low'];

  for (let i = 0; i < todaySlots.length; i++) {
    const slot = todaySlots[i];
    const appointmentId = generateUUID();
    const confirmationCode = `APT${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    db.prepare(`
      INSERT INTO Appointment (
        id, confirmationCode, patientId, providerId, departmentId,
        timeSlotId, locationId, scheduledStart, scheduledEnd,
        status, appointmentType, reason, noShowRisk, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appointmentId,
      confirmationCode,
      patient.id,
      provider.id,
      orthoDept.id,
      slot.id,
      mainLocation.id,
      slot.startTime,
      slot.endTime,
      statuses[i],
      'Consultation',
      i === 0 ? 'Knee pain follow-up' : i === 1 ? 'Annual checkup' : i === 2 ? 'Post-surgery review' : 'New patient consultation',
      risks[i],
      now,
      now
    );
  }

  console.log(`✅ Created ${todaySlots.length} appointments for today\n`);

  console.log('Creating waitlist entries...');

  // Create waitlist entries
  const priorities = ['high', 'medium'];
  const waitlistStatuses = ['active', 'contacted'];

  for (let i = 0; i < 2; i++) {
    const entryId = generateUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO WaitlistEntry (
        id, patientId, departmentId, providerId,
        priority, status, requestedDate, expiresAt,
        notes, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entryId,
      patient.id,
      i === 0 ? orthoDept.id : cardioDept.id,
      provider.id,
      priorities[i],
      waitlistStatuses[i],
      now,
      expiresAt,
      i === 0 ? 'Urgent follow-up needed' : 'Routine appointment requested',
      now,
      now
    );
  }

  console.log(`✅ Created 2 waitlist entries\n`);

  console.log('🎉 Sample data creation completed!\n');
  console.log('📊 Summary:');
  console.log(`   - ${slots.length} Time Slots (available for booking)`);
  console.log(`   - ${todaySlots.length} Today's Appointments`);
  console.log(`   - 2 Waitlist Entries`);
  console.log('\n✨ Backend is ready for frontend integration!\n');
}

seedSampleData()
  .catch((error) => {
    console.error('❌ Sample data creation failed:', error);
    process.exit(1);
  })
  .finally(() => {
    db.close();
  });
