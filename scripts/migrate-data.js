require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function migrate() {
  console.log('Starting data migration from Supabase to MySQL...\n');

  // 1. Create users + profiles (skip test@email.com and already-logged-in kamm.holding)
  const users = [
    {
      id: 'user-wqfalquran',
      email: 'wqfalquran@gmail.com',
      name: 'الوقف العالمي',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocIMhWbxbl3Mp2NStFoQkvWblWcj_irw1Wx-AWYjqX550CPmWTU=s96-c',
      supabaseId: '59ab8b05-29b4-4a1c-a5a0-050ec0f72e5d',
      createdAt: new Date('2026-01-15T14:24:07.872Z'),
    },
    {
      id: 'user-aayaatco',
      email: 'aayaatco@gmail.com',
      name: 'الوقف العالمي للقرآن الكريم',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocLEANxRHyFosT-4X_GAV1tX-vy0oabDk3gqGco6oCPLttWVVJA=s96-c',
      supabaseId: '5d5f7f19-2eef-46d1-a979-5578f95285cc',
      createdAt: new Date('2026-01-11T11:43:05.604Z'),
      roles: ['student', 'scholar'],
    },
    {
      id: 'user-tmkinai',
      email: 'tmkin.ai@gmail.com',
      name: 'Ahmed Tmkin',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocJ4p3PHDvOvROeUEXIbkUNFKA5NRIt2YxPDZAd_87ZvdWxguA=s96-c',
      supabaseId: '9ea636b3-f8f6-43c7-b5a9-6a0d953f892d',
      createdAt: new Date('2026-01-11T11:35:09.388Z'),
    },
    {
      id: 'user-aayaatgh',
      email: 'aayaat.gh@gmail.com',
      name: 'غازي الحربي',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocISAu2otTVOOjF6HHwyy46ZHAI9HoQ6neDKfVYuIwKKsFEIs4k=s96-c',
      supabaseId: 'cfbaac16-6ea7-4940-acf3-4f05ab5a818d',
      phone: '+966555320076',
      createdAt: new Date('2026-01-13T18:43:04.439Z'),
    },
  ];

  // Map old supabase IDs to new IDs
  const idMap = {};
  users.forEach(u => { idMap[u.supabaseId] = u.id; });

  for (const u of users) {
    const existing = await p.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`  User ${u.email} already exists (id: ${existing.id}), updating idMap`);
      idMap[u.supabaseId] = existing.id;
      // Ensure profile exists
      const prof = await p.profile.findUnique({ where: { id: existing.id } });
      if (!prof) {
        await p.profile.create({
          data: {
            id: existing.id, fullName: u.name, email: u.email,
            avatarUrl: u.image, phoneNumber: u.phone || null,
            roles: JSON.stringify(u.roles || ['student']),
            createdAt: u.createdAt,
          },
        });
        console.log(`    Created missing profile for ${u.email}`);
      }
      continue;
    }
    await p.user.create({
      data: {
        id: u.id, email: u.email, name: u.name, image: u.image,
        profile: {
          create: {
            fullName: u.name, email: u.email, avatarUrl: u.image,
            phoneNumber: u.phone || null,
            roles: JSON.stringify(u.roles || ['student']),
            createdAt: u.createdAt,
          },
        },
      },
    });
    console.log(`  Created user: ${u.email} (${u.id})`);
  }

  // 2. Scholar (aayaatco@gmail.com)
  const scholarUserId = idMap['5d5f7f19-2eef-46d1-a979-5578f95285cc'];
  const existingScholar = await p.scholar.findUnique({ where: { id: scholarUserId } });
  if (!existingScholar) {
    await p.scholar.create({
      data: {
        id: scholarUserId,
        specialization: 'حفظ وتجويد',
        isActive: true,
        profileVisibility: 'public',
        createdAt: new Date('2026-01-12T15:03:01.559Z'),
      },
    });
    console.log(`  Created scholar for ${scholarUserId}`);
  } else {
    console.log(`  Scholar already exists`);
  }

  // Update scholar's profile to include scholar role
  await p.profile.update({
    where: { id: scholarUserId },
    data: { roles: JSON.stringify(['student', 'scholar']) },
  });

  // 3. Application
  const appUserId = idMap['9ea636b3-f8f6-43c7-b5a9-6a0d953f892d'];
  const existingApp = await p.ijazahApplication.findUnique({ where: { applicationNumber: 'IJZ-1768136529497-1S25I0' } });
  if (!existingApp) {
    await p.ijazahApplication.create({
      data: {
        id: 'app-af11ab4c',
        userId: appUserId,
        applicationNumber: 'IJZ-1768136529497-1S25I0',
        ijazahType: 'hifz',
        status: 'approved',
        personalInfo: { city: 'riyadh', email: 'tmkin.ai@gmail.com', phone: '+966555320076', country: 'Saudi Arabia', fullName: 'أحمد محمد', dateOfBirth: '1999-09-02' },
        academicBackground: { yearsOfStudy: '1', educationLevel: 'bachelor', quranInstitution: '' },
        quranExperience: { previousIjazat: '', tajweedKnowledge: 'beginner', memorizationLevel: 'partial', recitationProficiency: 'beginner' },
        submittedAt: new Date('2026-01-11T13:02:09.497Z'),
        reviewedAt: new Date('2026-01-11T13:05:01.721Z'),
        decidedAt: new Date('2026-01-11T13:05:04.028Z'),
        createdAt: new Date('2026-01-11T13:02:06.554Z'),
      },
    });
    console.log(`  Created application IJZ-1768136529497-1S25I0`);
  } else {
    console.log(`  Application already exists`);
  }

  // 4. Certificates
  const certs = [
    {
      id: 'cert-e5bab88b', applicationId: 'app-af11ab4c', userId: appUserId, scholarId: scholarUserId,
      certificateNumber: 'IJZ-2026-DOU3M6', ijazahType: 'hifz', status: 'active',
      recitation: 'حفص عن عاصم', issueDate: '2026-01-11', isPublic: false,
      metadata: { issue_place: 'الرياض', student_name: 'أحمد محمد', student_email: 'tmkin.ai@gmail.com' },
      createdAt: new Date('2026-01-11T15:06:15.174Z'),
    },
    {
      id: 'cert-a39d8dba', applicationId: 'app-af11ab4c', userId: appUserId, scholarId: scholarUserId,
      certificateNumber: 'IJZ-2026-M14VLS', ijazahType: 'hifz', status: 'active',
      recitation: 'حفص عن عاصم', issueDate: '2026-01-11', isPublic: false,
      metadata: { issue_place: 'الرياض', student_name: 'أحمد محمد', student_email: 'tmkin.ai@gmail.com' },
      createdAt: new Date('2026-01-11T15:21:34.207Z'),
    },
    {
      id: 'cert-80482b5e', applicationId: null, userId: null, scholarId: scholarUserId,
      certificateNumber: 'GH-00000001', ijazahType: 'qirat', status: 'active',
      recitation: 'حفص عن عاصم', issueDate: '2026-01-12', isPublic: true,
      verificationHash: 'f7d6948b92c6de980391f8d948f1ab04f3213ad3bce366d17ca2758004fce977',
      verificationCount: 3, lastVerifiedAt: new Date('2026-01-12T13:11:02.816Z'),
      metadata: { archived: false, is_public: true, hijri_date: '٢٣ رجب ١٤٤٧ هـ', issue_place: 'المملكة العربية السعودية', serial_code: '20260112-F7D6', student_name: 'مُحَمَّدٌ مَحْمُودُ مَحْمَدٍ حَمْدٍ', student_email: 'tmkin.ai@gmail.com', certificate_title: 'إجازة قرآنية', digital_fingerprint: 'f7d6948b92c6de980391f8d948f1ab04f3213ad3bce366d17ca2758004fce977', show_in_student_portal: true },
      createdAt: new Date('2026-01-12T10:25:21.646Z'),
    },
    {
      id: 'cert-38d24c0f', applicationId: null, userId: null, scholarId: scholarUserId,
      certificateNumber: 'GH-00000002', ijazahType: 'qirat', status: 'active',
      recitation: '', issueDate: '2026-01-12', isPublic: true,
      verificationHash: 'e852a705469fb9835aca21e6e59c8225d9635de2c34246144b3d7dac1bdfb61f',
      verificationCount: 10, lastVerifiedAt: new Date('2026-01-12T15:19:43.663Z'),
      metadata: { archived: false, is_public: true, hijri_date: '٢٣ رجب ١٤٤٧ هـ', issue_place: 'المملكة العربية السعودية', serial_code: '20260112-E852', student_name: 'مُحَمَّدٌ مَحْمُودُ مَحْمَدٍ حَمْدٍ', certificate_title: 'إجازة قرآنية', digital_fingerprint: 'e852a705469fb9835aca21e6e59c8225d9635de2c34246144b3d7dac1bdfb61f', show_in_student_portal: true },
      createdAt: new Date('2026-01-12T14:23:55.425Z'),
    },
    {
      id: 'cert-eb85d65b', applicationId: null, userId: null, scholarId: scholarUserId,
      certificateNumber: 'GH-00000003', ijazahType: 'qirat', status: 'active',
      recitation: 'حفص عن عاصم', issueDate: '2026-01-12', isPublic: true,
      verificationHash: 'a6268e155611e7a34f5b37f8df14ad750bcd951d9bf827121b98ead1c31c1882',
      verificationCount: 9, lastVerifiedAt: new Date('2026-03-12T20:05:07.667Z'),
      metadata: { archived: false, is_public: true, hijri_date: '٢٣ رجب ١٤٤٧ هـ', issue_place: 'المملكة العربية السعودية', serial_code: '20260112-A626', student_name: 'مُحَمَّدٌ مَحْمُودُ مَحْمَدٍ حَمْدٍ', certificate_title: 'إجازة القراءات القرآنية', digital_fingerprint: 'a6268e155611e7a34f5b37f8df14ad750bcd951d9bf827121b98ead1c31c1882', show_in_student_portal: true },
      createdAt: new Date('2026-01-12T15:09:21.520Z'),
    },
  ];

  for (const c of certs) {
    const existing = await p.ijazahCertificate.findUnique({ where: { certificateNumber: c.certificateNumber } });
    if (existing) {
      console.log(`  Certificate ${c.certificateNumber} already exists`);
      continue;
    }
    await p.ijazahCertificate.create({
      data: {
        id: c.id,
        applicationId: c.applicationId,
        userId: c.userId,
        scholarId: c.scholarId,
        certificateNumber: c.certificateNumber,
        ijazahType: c.ijazahType,
        status: c.status,
        recitation: c.recitation,
        issueDate: c.issueDate,
        isPublic: c.isPublic,
        verificationHash: c.verificationHash || null,
        verificationCount: c.verificationCount || 0,
        lastVerifiedAt: c.lastVerifiedAt || null,
        metadata: c.metadata,
        createdAt: c.createdAt,
      },
    });
    console.log(`  Created certificate: ${c.certificateNumber}`);
  }

  console.log('\nMigration complete!');

  // Summary
  const counts = {
    users: await p.user.count(),
    profiles: await p.profile.count(),
    scholars: await p.scholar.count(),
    applications: await p.ijazahApplication.count(),
    certificates: await p.ijazahCertificate.count(),
  };
  console.log('Database counts:', counts);

  await p.$disconnect();
}

migrate().catch(e => { console.error('Migration failed:', e); process.exit(1); });
