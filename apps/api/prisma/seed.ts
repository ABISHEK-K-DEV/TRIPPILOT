/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SAMPLE_COUNTRIES, SAMPLE_DATA_SOURCE, SAMPLE_DESTINATIONS } from '../src/data/sample-destinations';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TripPilot sample data…');

  for (const c of SAMPLE_COUNTRIES) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name, flag: c.flag, currency: c.currency, continent: c.continent, visaRequirementIN: c.visaRequirementIN },
      create: { ...c, visaInfoUpdatedAt: new Date() },
    });
  }

  for (const d of SAMPLE_DESTINATIONS) {
    const { attractions, idealDays, costProfile, ...rest } = d;
    const data = {
      ...rest,
      idealDaysMin: idealDays[0],
      idealDaysMax: idealDays[1],
      costProfile: costProfile as object,
      costCurrency: 'INR',
      dataConfidence: 'SAMPLE' as const,
      dataSource: SAMPLE_DATA_SOURCE,
      dataUpdatedAt: new Date(),
    };
    const dest = await prisma.destination.upsert({ where: { slug: d.slug }, update: data, create: data });
    // Attractions are fully owned by the seed: replace them to keep the seed idempotent.
    await prisma.attraction.deleteMany({ where: { destinationId: dest.id } });
    await prisma.attraction.createMany({
      data: attractions.map(({ price, ...a }, i) => ({
        ...a,
        sortOrder: i,
        destinationId: dest.id,
        priceAmount: price,
        priceCurrency: 'INR',
        priceConfidence: 'SAMPLE' as const,
      })),
    });
  }

  await prisma.travelProvider.upsert({
    where: { slug: 'trippilot-estimate' },
    update: {},
    create: { slug: 'trippilot-estimate', name: 'TripPilot estimate models', kind: 'FLIGHT', isAffiliate: false, freshnessMinutes: 0 },
  });

  const plans = [
    { slug: 'free', name: 'Explorer', description: 'Plan trips with estimates and sample itineraries.', priceAmount: 0, interval: 'MONTHLY' as const, features: { aiPlansPerMonth: 5, groupMembers: 4, priceAlerts: 2 } },
    { slug: 'pro-monthly', name: 'Pilot Pro', description: 'Unlimited AI itineraries, price alerts and group planning.', priceAmount: 299, interval: 'MONTHLY' as const, features: { aiPlansPerMonth: -1, groupMembers: 20, priceAlerts: 50 } },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({ where: { slug: p.slug }, update: p, create: { ...p, currency: 'INR' } });
  }

  // Demo account for local development only.
  if (process.env.NODE_ENV !== 'production') {
    await prisma.user.upsert({
      where: { email: 'demo@trippilot.dev' },
      update: {},
      create: {
        email: 'demo@trippilot.dev',
        name: 'Demo Traveller',
        homeCity: 'Bengaluru',
        homeAirport: 'BLR',
        passwordHash: await bcrypt.hash('TripPilot123', 12),
        preferences: { create: { interests: ['beach', 'food', 'culture'] } },
      },
    });
  }

  const counts = {
    countries: await prisma.country.count(),
    destinations: await prisma.destination.count(),
    attractions: await prisma.attraction.count(),
  };
  console.log('Done:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
