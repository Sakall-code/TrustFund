import type { Campaign, Contribution, Address } from '../types';

const now = Math.floor(Date.now() / 1000);
const DAY = 86400;

export const MOCK_CAMPAIGNS: Campaign[] = [
  // 1 — Fully funded & claimed
  {
    campaignId: 1,
    title: 'Solar Lamps for Rural Schools',
    description:
      'Provide solar-powered desk lamps to 500 students in off-grid villages so they can study after sunset. Each lamp lasts 5+ years and replaces dangerous kerosene alternatives.',
    tags: ['Education', 'Environment'],
    imageCid: 'QmSolarLampsPlaceholder0001',
    creatorAddress: '0x1111111111111111111111111111111111111111' as Address,
    creatorName: 'Aarav Patel',
    createdAt: '2024-01-15T10:00:00Z',
    chain: {
      campaignId: 1,
      owner: '0x1111111111111111111111111111111111111111' as Address,
      goalWei: '50000000000000000000',
      raisedWei: '52000000000000000000',
      deadline: now - 30 * DAY,
      claimed: true,
    },
  },
  // 2 — Fully funded, not yet claimed
  {
    campaignId: 2,
    title: 'Village Library Renovation',
    description:
      'Renovate the century-old community library in Greendale village. Funds cover new shelving, a children\'s reading corner, and 2,000 book donations from local publishers.',
    tags: ['Education', 'Community'],
    imageCid: 'QmVillageLibraryPlaceholder002',
    creatorAddress: '0x2222222222222222222222222222222222222222' as Address,
    creatorName: 'Mei Chen',
    createdAt: '2024-02-10T14:30:00Z',
    chain: {
      campaignId: 2,
      owner: '0x2222222222222222222222222222222222222222' as Address,
      goalWei: '30000000000000000000',
      raisedWei: '31500000000000000000',
      deadline: now + 5 * DAY,
      claimed: false,
    },
  },
  // 3 — Fully funded, not yet claimed
  {
    campaignId: 3,
    title: 'Community Animal Shelter',
    description:
      'Build a no-kill animal shelter with capacity for 120 rescued dogs and cats. The shelter will include a veterinary clinic and adoption center open to the public.',
    tags: ['Animals', 'Community'],
    imageCid: 'QmAnimalShelterPlaceholder003',
    creatorAddress: '0x3333333333333333333333333333333333333333' as Address,
    creatorName: 'Sofia Rodriguez',
    createdAt: '2024-03-05T09:15:00Z',
    chain: {
      campaignId: 3,
      owner: '0x3333333333333333333333333333333333333333' as Address,
      goalWei: '80000000000000000000',
      raisedWei: '82000000000000000000',
      deadline: now + 10 * DAY,
      claimed: false,
    },
  },
  // 4 — In progress, ~60%
  {
    campaignId: 4,
    title: 'Student Robotics Team — Nationals',
    description:
      'Help the Lincoln High robotics team travel to the national championship. Funds cover parts, travel, and accommodation for 12 students and 2 mentors.',
    tags: ['Technology', 'Education'],
    imageCid: 'QmRoboticsTeamPlaceholder004',
    creatorAddress: '0x4444444444444444444444444444444444444444' as Address,
    creatorName: 'James Okafor',
    createdAt: '2024-04-20T11:00:00Z',
    chain: {
      campaignId: 4,
      owner: '0x4444444444444444444444444444444444444444' as Address,
      goalWei: '25000000000000000000',
      raisedWei: '15000000000000000000',
      deadline: now + 20 * DAY,
      claimed: false,
    },
  },
  // 5 — In progress, ~40%
  {
    campaignId: 5,
    title: 'Clean Water Wells for Sahel Region',
    description:
      'Drill three deep-bore wells in drought-affected communities across the Sahel. Each well serves ~1,200 residents and includes a solar-powered pump system.',
    tags: ['Health', 'Environment'],
    imageCid: 'QmCleanWaterPlaceholder00005',
    creatorAddress: '0x5555555555555555555555555555555555555555' as Address,
    creatorName: 'Fatima Diallo',
    createdAt: '2024-05-01T08:45:00Z',
    chain: {
      campaignId: 5,
      owner: '0x5555555555555555555555555555555555555555' as Address,
      goalWei: '100000000000000000000',
      raisedWei: '40000000000000000000',
      deadline: now + 45 * DAY,
      claimed: false,
    },
  },
  // 6 — In progress, ~25%
  {
    campaignId: 6,
    title: "Women's Coding Bootcamp Scholarships",
    description:
      'Fund 20 full scholarships for women entering tech through a 12-week intensive coding bootcamp. Covers tuition, laptops, and mentorship matching.',
    tags: ['Technology', 'Education'],
    imageCid: 'QmCodingBootcampPlaceholder6',
    creatorAddress: '0x6666666666666666666666666666666666666666' as Address,
    creatorName: 'Priya Sharma',
    createdAt: '2024-05-18T16:00:00Z',
    chain: {
      campaignId: 6,
      owner: '0x6666666666666666666666666666666666666666' as Address,
      goalWei: '60000000000000000000',
      raisedWei: '15000000000000000000',
      deadline: now + 60 * DAY,
      claimed: false,
    },
  },
  // 7 — In progress, ~75%
  {
    campaignId: 7,
    title: 'Urban Rooftop Garden Project',
    description:
      'Transform 10 unused rooftops in downtown Portland into thriving community gardens. Each garden produces fresh vegetables for local food banks year-round.',
    tags: ['Environment', 'Community'],
    imageCid: 'QmUrbanGardenPlaceholder007',
    creatorAddress: '0x7777777777777777777777777777777777777777' as Address,
    creatorName: 'Carlos Mendez',
    createdAt: '2024-06-02T12:30:00Z',
    chain: {
      campaignId: 7,
      owner: '0x7777777777777777777777777777777777777777' as Address,
      goalWei: '40000000000000000000',
      raisedWei: '30000000000000000000',
      deadline: now + 15 * DAY,
      claimed: false,
    },
  },
  // 8 — Expired and failed (~30%)
  {
    campaignId: 8,
    title: 'Indie Documentary: Ocean Voices',
    description:
      'A feature-length documentary following five coastal communities fighting rising sea levels. Funds cover filming equipment, crew travel, and post-production.',
    tags: ['Arts', 'Environment'],
    imageCid: 'QmDocumentaryPlaceholder008',
    creatorAddress: '0x8888888888888888888888888888888888888888' as Address,
    creatorName: 'Lena Johansson',
    createdAt: '2024-03-10T07:00:00Z',
    chain: {
      campaignId: 8,
      owner: '0x8888888888888888888888888888888888888888' as Address,
      goalWei: '75000000000000000000',
      raisedWei: '22500000000000000000',
      deadline: now - 15 * DAY,
      claimed: false,
    },
  },
  // 9 — Expired and failed (~15%)
  {
    campaignId: 9,
    title: 'Youth Basketball Court Rebuild',
    description:
      'Rebuild the crumbling outdoor basketball court at Riverside Park. The new court will feature regulation markings, LED lighting, and weather-resistant surfacing.',
    tags: ['Sports', 'Community'],
    imageCid: 'QmBasketballCourtPlacehld09',
    creatorAddress: '0x9999999999999999999999999999999999999999' as Address,
    creatorName: 'David Kim',
    createdAt: '2024-04-01T15:20:00Z',
    chain: {
      campaignId: 9,
      owner: '0x9999999999999999999999999999999999999999' as Address,
      goalWei: '20000000000000000000',
      raisedWei: '3000000000000000000',
      deadline: now - 20 * DAY,
      claimed: false,
    },
  },
  // 10 — Expired and claimed (fully funded before expiry)
  {
    campaignId: 10,
    title: 'Emergency Flood Relief — River Towns',
    description:
      'Urgent relief for families displaced by severe flooding along the Missouri River. Funds provide temporary shelter, clean water, and emergency medical supplies.',
    tags: ['Emergency', 'Health'],
    imageCid: 'QmFloodReliefPlaceholder010',
    creatorAddress: '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa' as Address,
    creatorName: 'Rachel Torres',
    createdAt: '2024-02-28T06:00:00Z',
    chain: {
      campaignId: 10,
      owner: '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa' as Address,
      goalWei: '90000000000000000000',
      raisedWei: '95000000000000000000',
      deadline: now - 5 * DAY,
      claimed: true,
    },
  },
];

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  // Campaign 1 — Solar Lamps (3 contributions)
  { campaignId: 1, backer: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address, amountWei: '5000000000000000000', txHash: '0xaaa0000000000000000000000000000000000000000000000000000000000001', timestamp: now - 60 * DAY },
  { campaignId: 1, backer: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address, amountWei: '20000000000000000000', txHash: '0xaaa0000000000000000000000000000000000000000000000000000000000002', timestamp: now - 55 * DAY },
  { campaignId: 1, backer: '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD' as Address, amountWei: '27000000000000000000', txHash: '0xaaa0000000000000000000000000000000000000000000000000000000000003', timestamp: now - 50 * DAY },
  // Campaign 2 — Village Library (2 contributions)
  { campaignId: 2, backer: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address, amountWei: '10000000000000000000', txHash: '0xbbb0000000000000000000000000000000000000000000000000000000000001', timestamp: now - 40 * DAY },
  { campaignId: 2, backer: '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE' as Address, amountWei: '21500000000000000000', txHash: '0xbbb0000000000000000000000000000000000000000000000000000000000002', timestamp: now - 35 * DAY },
  // Campaign 3 — Animal Shelter (2 contributions)
  { campaignId: 3, backer: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address, amountWei: '40000000000000000000', txHash: '0xccc0000000000000000000000000000000000000000000000000000000000001', timestamp: now - 30 * DAY },
  { campaignId: 3, backer: '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD' as Address, amountWei: '42000000000000000000', txHash: '0xccc0000000000000000000000000000000000000000000000000000000000002', timestamp: now - 25 * DAY },
  // Campaign 4 — Robotics (3 contributions)
  { campaignId: 4, backer: '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE' as Address, amountWei: '5000000000000000000', txHash: '0xddd0000000000000000000000000000000000000000000000000000000000001', timestamp: now - 10 * DAY },
  { campaignId: 4, backer: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF' as Address, amountWei: '5000000000000000000', txHash: '0xddd0000000000000000000000000000000000000000000000000000000000002', timestamp: now - 8 * DAY },
  { campaignId: 4, backer: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address, amountWei: '5000000000000000000', txHash: '0xddd0000000000000000000000000000000000000000000000000000000000003', timestamp: now - 5 * DAY },
  // Campaign 5 — Clean Water (2 contributions)
  { campaignId: 5, backer: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address, amountWei: '20000000000000000000', txHash: '0xeee0000000000000000000000000000000000000000000000000000000000001', timestamp: now - 20 * DAY },
  { campaignId: 5, backer: '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD' as Address, amountWei: '20000000000000000000', txHash: '0xeee0000000000000000000000000000000000000000000000000000000000002', timestamp: now - 15 * DAY },
  // Campaign 6 — Coding Bootcamp (2 contributions)
  { campaignId: 6, backer: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF' as Address, amountWei: '10000000000000000000', txHash: '0xfff0000000000000000000000000000000000000000000000000000000000001', timestamp: now - 7 * DAY },
  { campaignId: 6, backer: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address, amountWei: '5000000000000000000', txHash: '0xfff0000000000000000000000000000000000000000000000000000000000002', timestamp: now - 3 * DAY },
  // Campaign 7 — Urban Garden (2 contributions)
  { campaignId: 7, backer: '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE' as Address, amountWei: '15000000000000000000', txHash: '0x1110000000000000000000000000000000000000000000000000000000000001', timestamp: now - 12 * DAY },
  { campaignId: 7, backer: '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD' as Address, amountWei: '15000000000000000000', txHash: '0x1110000000000000000000000000000000000000000000000000000000000002', timestamp: now - 9 * DAY },
  // Campaign 8 — Documentary (1 contribution)
  { campaignId: 8, backer: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF' as Address, amountWei: '22500000000000000000', txHash: '0x2220000000000000000000000000000000000000000000000000000000000001', timestamp: now - 45 * DAY },
  // Campaign 9 — Basketball Court (1 contribution)
  { campaignId: 9, backer: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' as Address, amountWei: '3000000000000000000', txHash: '0x3330000000000000000000000000000000000000000000000000000000000001', timestamp: now - 40 * DAY },
  // Campaign 10 — Flood Relief (2 contributions)
  { campaignId: 10, backer: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' as Address, amountWei: '50000000000000000000', txHash: '0x4440000000000000000000000000000000000000000000000000000000000001', timestamp: now - 25 * DAY },
  { campaignId: 10, backer: '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE' as Address, amountWei: '45000000000000000000', txHash: '0x4440000000000000000000000000000000000000000000000000000000000002', timestamp: now - 22 * DAY },
];
