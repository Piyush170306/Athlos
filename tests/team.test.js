const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Replicate pure parser function for unit testing in CommonJS node test environment
function parseTeamFilename(filename) {
  const normalizedLower = filename.toLowerCase();
  if (
    normalizedLower.startsWith('full-team-photo') ||
    normalizedLower.startsWith('full_team_photo') ||
    normalizedLower.startsWith('fullteamphoto')
  ) {
    return { type: 'full-team' };
  }

  const baseName = filename.replace(/(\.(jpg|jpeg|png|webp))+$/i, '');
  const prefixMatch = baseName.match(/^(senior|junior)[-_](\d+)[-_](.+)$/i);
  if (!prefixMatch) {
    return {
      type: 'invalid',
      error: `Filename "${filename}" does not match the convention`,
    };
  }

  const teamCategory = prefixMatch[1].toLowerCase() === 'senior' ? 'Senior Team' : 'Junior Team';
  const orderNum = parseInt(prefixMatch[2], 10);
  const rest = prefixMatch[3].trim();

  let name = '';
  let designation = '';

  const knownDesignationRegex = /[-_](co[-_ ]?coordinator|co[-_ ]?ordinator|coordinator|core[-_ ]?member|junior[-_ ]?member|member)$/i;
  const knownMatch = rest.match(knownDesignationRegex);

  if (knownMatch && knownMatch.index !== undefined) {
    name = rest.slice(0, knownMatch.index).trim();
    designation = knownMatch[1].trim();
  } else if (rest.includes('_')) {
    const parts = rest.split('_').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      designation = parts[parts.length - 1];
      name = parts.slice(0, -1).join(' ');
    } else {
      name = parts[0] || 'Unknown';
      designation = 'Member';
    }
  } else if (rest.includes('-')) {
    const parts = rest.split('-').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      designation = parts[parts.length - 1];
      name = parts.slice(0, -1).join(' ');
    } else {
      name = parts[0] || 'Unknown';
      designation = 'Member';
    }
  } else {
    return {
      type: 'invalid',
      error: `Filename "${filename}" lacks a separator between member name and designation`,
    };
  }

  name = name.trim();
  designation = designation.trim();

  return {
    type: 'member',
    member: {
      team: teamCategory,
      order: orderNum,
      name,
      designation,
      imageSrc: `/assets/team/${filename}`,
    },
  };
}

test('Team Parser: Correctly extracts Senior Team members from filenames', () => {
  const s01 = parseTeamFilename('senior_01_Khyati Singla_CO-ORDINATOR.jpg.jpeg');
  assert.strictEqual(s01.type, 'member');
  assert.strictEqual(s01.member.team, 'Senior Team');
  assert.strictEqual(s01.member.order, 1);
  assert.strictEqual(s01.member.name, 'Khyati Singla');
  assert.strictEqual(s01.member.designation, 'CO-ORDINATOR');

  const s02 = parseTeamFilename('senior-02-Vincent Joseph-Co-Coordinator.jpg');
  assert.strictEqual(s02.type, 'member');
  assert.strictEqual(s02.member.team, 'Senior Team');
  assert.strictEqual(s02.member.order, 2);
  assert.strictEqual(s02.member.name, 'Vincent Joseph');
  assert.strictEqual(s02.member.designation, 'Co-Coordinator');

  const s03 = parseTeamFilename('senior_03_Rohan Misra_Core Member.jpg.jpeg');
  assert.strictEqual(s03.member.order, 3);
  assert.strictEqual(s03.member.name, 'Rohan Misra');
  assert.strictEqual(s03.member.designation, 'Core Member');

  const s04 = parseTeamFilename('senior_04_Kavya Thakkar_Core Member.jpg.jpeg');
  assert.strictEqual(s04.member.order, 4);
  assert.strictEqual(s04.member.name, 'Kavya Thakkar');
  assert.strictEqual(s04.member.designation, 'Core Member');
});

test('Team Parser: Correctly extracts Junior Team members from filenames', () => {
  const j01 = parseTeamFilename('junior_01_Piyush Mahajan_Junior Member.jpg.jpeg');
  assert.strictEqual(j01.type, 'member');
  assert.strictEqual(j01.member.team, 'Junior Team');
  assert.strictEqual(j01.member.order, 1);
  assert.strictEqual(j01.member.name, 'Piyush Mahajan');
  assert.strictEqual(j01.member.designation, 'Junior Member');

  const j02 = parseTeamFilename('junior_02_Aditya S_Junior Member.jpg.jpeg');
  assert.strictEqual(j02.member.order, 2);
  assert.strictEqual(j02.member.name, 'Aditya S');
  assert.strictEqual(j02.member.designation, 'Junior Member');

  const j03 = parseTeamFilename('junior_03_Shaurya_Junior Member.jpg.jpeg');
  assert.strictEqual(j03.member.order, 3);
  assert.strictEqual(j03.member.name, 'Shaurya');
  assert.strictEqual(j03.member.designation, 'Junior Member');
});

test('Team Parser: Full team photograph is recognized', () => {
  const full1 = parseTeamFilename('full-team-photo.jpg');
  assert.strictEqual(full1.type, 'full-team');

  const full2 = parseTeamFilename('full_team_photo.jpg.jpeg');
  assert.strictEqual(full2.type, 'full-team');
});

test('Team Parser: Flags ambiguous duplicates and missing slots as required by Rule 10', () => {
  const teamDir = path.join(process.cwd(), 'public', 'assets', 'team');
  assert.ok(fs.existsSync(teamDir), 'public/assets/team directory must exist');

  const files = fs.readdirSync(teamDir);
  const parsedMembers = files.map(parseTeamFilename).filter((p) => p.type === 'member').map((p) => p.member);

  const senior = parsedMembers.filter((m) => m.team === 'Senior Team');
  const junior = parsedMembers.filter((m) => m.team === 'Junior Team');

  assert.strictEqual(senior.length, 4, 'Senior team must contain exactly 4 members');

  // Detect duplicate index in Junior Team (both Harvansh and Renita share 04)
  const jOrders = junior.map((m) => m.order);
  const duplicates = jOrders.filter((item, index) => jOrders.indexOf(item) !== index);
  assert.ok(duplicates.includes(4), 'Duplicate index 4 must be detected in uploaded assets');

  // Check that index 6 is missing in the uploaded folder
  assert.ok(!jOrders.includes(6), 'Index 6 must be flagged as missing from current uploaded files');
});
