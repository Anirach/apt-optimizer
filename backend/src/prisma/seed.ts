import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create locations
  const mainClinic = await prisma.location.create({
    data: {
      name: 'Main Clinic',
      building: 'Building A',
      floor: '2nd Floor',
      room: '201',
      addressStreet: '123 Healthcare Road',
      addressDistrict: 'Watthana',
      addressProvince: 'Bangkok',
      addressPostal: '10110',
      addressCountry: 'Thailand',
    },
  });

  const eastWing = await prisma.location.create({
    data: {
      name: 'East Wing',
      building: 'Building B',
      floor: '1st Floor',
      room: '105',
      addressStreet: '123 Healthcare Road',
      addressDistrict: 'Watthana',
      addressProvince: 'Bangkok',
      addressPostal: '10110',
      addressCountry: 'Thailand',
    },
  });

  // Create departments
  const orthopedics = await prisma.department.create({
    data: {
      name: 'Orthopedics',
      code: 'ORTHO',
      description: 'Bone, joint, and muscle care',
      locationId: mainClinic.id,
      defaultAppointmentDuration: 30,
      isActive: true,
    },
  });

  const cardiology = await prisma.department.create({
    data: {
      name: 'Cardiology',
      code: 'CARDIO',
      description: 'Heart and cardiovascular care',
      locationId: eastWing.id,
      defaultAppointmentDuration: 45,
      isActive: true,
    },
  });

  const general = await prisma.department.create({
    data: {
      name: 'General Medicine',
      code: 'GENERAL',
      description: 'General health and wellness',
      locationId: mainClinic.id,
      defaultAppointmentDuration: 20,
      isActive: true,
    },
  });

  // Create users and providers
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'sarah.chen@hospital.com',
      password: hashedPassword,
      role: 'provider',
      firstName: 'Sarah',
      lastName: 'Chen',
      phone: '+66-2-123-4567',
    },
  });

  await prisma.provider.create({
    data: {
      userId: user1.id,
      firstName: 'Sarah',
      lastName: 'Chen',
      title: 'Dr.',
      specialties: JSON.stringify(['Orthopedics', 'Sports Medicine']),
      departments: JSON.stringify([orthopedics.id]),
      licenseNumber: 'MD-12345',
      email: 'sarah.chen@hospital.com',
      phone: '+66-2-123-4567',
      bio: 'Specializing in orthopedic surgery with 15 years of experience',
      isActive: true,
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+66-2-000-0000',
    },
  });

  // Create sample patient
  await prisma.patient.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      phone: '+66-81-234-5678',
      email: 'john.doe@email.com',
      pdpaConsent: true,
      pdpaConsentDate: new Date(),
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
