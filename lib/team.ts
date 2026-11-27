import fs from 'fs';
import path from 'path';

export interface TeamMember {
  id: string;
  team: 'Senior Team' | 'Junior Team';
  order: number;
  name: string;
  designation: string;
  imageSrc: string;
  isAmbiguous?: boolean;
  ambiguityReason?: string;
}

export interface TeamData {
  fullTeamPhoto: string | null;
  seniorTeam: TeamMember[];
  juniorTeam: TeamMember[];
  ambiguities: string[];
}

/**
 * Parses a single team image filename according to the ATHLOS naming convention:
 * senior-01-Name-Designation.jpg or junior-01-Name-Designation.jpg
 * Also tolerates underscore separators and common image extensions (.jpg, .jpeg, .png).
 */
export function parseTeamFilename(filename: string): {
  type: 'member' | 'full-team' | 'invalid';
  member?: TeamMember;
  error?: string;
} {
  // Check for full team photo (e.g. full-team-photo.jpg, full_team_photo.jpg, etc.)
  const normalizedLower = filename.toLowerCase();
  if (
    normalizedLower.startsWith('full-team-photo') ||
    normalizedLower.startsWith('full_team_photo') ||
    normalizedLower.startsWith('fullteamphoto')
  ) {
    return { type: 'full-team' };
  }

  // Strip image extensions (handles single and double extensions like .jpg.jpeg)
  const baseName = filename.replace(/(\.(jpg|jpeg|png|webp))+$/i, '');

  // Match: (senior|junior)[-_](\d+)[-_](remaining string)
  const prefixMatch = baseName.match(/^(senior|junior)[-_](\d+)[-_](.+)$/i);
  if (!prefixMatch) {
    return {
      type: 'invalid',
      error: `Filename "${filename}" does not match the convention (expected senior-XX-Name-Designation.jpg or junior-XX-Name-Designation.jpg)`,
    };
  }

  const teamCategory = prefixMatch[1].toLowerCase() === 'senior' ? 'Senior Team' : 'Junior Team';
  const orderNum = parseInt(prefixMatch[2], 10);
  const rest = prefixMatch[3].trim();

  let name = '';
  let designation = '';

  // Check if rest contains a known designation at the end (handles compound designations like Co-Coordinator)
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

  // Clean trailing spaces or artifacts
  name = name.trim();
  // Normalize "Co-ordinator" (and case/format variations such as CO-ORDINATOR, Co-ordinator, co-ordinator) to "Coordinator"
  designation = designation.trim().replace(/\bco[-_]ordinator\b/gi, 'Coordinator');

  if (!name || !designation) {
    return {
      type: 'invalid',
      error: `Could not cleanly extract name and designation from "${filename}"`,
    };
  }

  const member: TeamMember = {
    id: `${prefixMatch[1].toLowerCase()}-${prefixMatch[2]}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    team: teamCategory,
    order: orderNum,
    name,
    designation,
    imageSrc: `/assets/team/${filename}`,
  };

  return {
    type: 'member',
    member,
  };
}

/**
 * Reads team photos from the project's public/assets/team directory
 * and extracts all team member information, numerical ordering, and flags any ambiguities.
 */
export function getTeamData(): TeamData {
  const teamDir = path.join(process.cwd(), 'public', 'assets', 'team');

  let fullTeamPhoto: string | null = null;
  const seniorMembers: TeamMember[] = [];
  const juniorMembers: TeamMember[] = [];
  const ambiguities: string[] = [];

  if (!fs.existsSync(teamDir)) {
    return {
      fullTeamPhoto: null,
      seniorTeam: [],
      juniorTeam: [],
      ambiguities: ['The team assets directory "public/assets/team" does not exist.'],
    };
  }

  const files = fs.readdirSync(teamDir);

  for (const file of files) {
    // Skip hidden files or directories
    if (file.startsWith('.')) continue;

    const parsed = parseTeamFilename(file);

    if (parsed.type === 'full-team') {
      fullTeamPhoto = `/assets/team/${file}`;
    } else if (parsed.type === 'member' && parsed.member) {
      if (parsed.member.team === 'Senior Team') {
        seniorMembers.push(parsed.member);
      } else {
        juniorMembers.push(parsed.member);
      }
    } else if (parsed.type === 'invalid' && parsed.error) {
      ambiguities.push(parsed.error);
    }
  }

  // Check numerical ordering & detect duplicate or missing numbers
  const checkDuplicatesAndOrder = (members: TeamMember[], teamName: string, expectedCount: number) => {
    // Sort primarily by order number
    members.sort((a, b) => a.order - b.order);

    const orderCounts = new Map<number, TeamMember[]>();
    for (const m of members) {
      const list = orderCounts.get(m.order) || [];
      list.push(m);
      orderCounts.set(m.order, list);
    }

    // Flag duplicate indices
    orderCounts.forEach((list, order) => {
      if (list.length > 1) {
        const names = list.map((m) => `"${m.name}" (${m.imageSrc.split('/').pop()})`).join(' and ');
        const warning = `Ambiguous order index #${String(order).padStart(2, '0')} in ${teamName}: Both ${names} share the same numerical order index.`;
        ambiguities.push(warning);
        list.forEach((m) => {
          m.isAmbiguous = true;
          m.ambiguityReason = `Shares index #${String(order).padStart(2, '0')}`;
        });
      }
    });

    // Flag missing indices if count doesn't match expected
    if (members.length < expectedCount) {
      ambiguities.push(
        `${teamName} currently has ${members.length} members loaded, but the fixed structure expects ${expectedCount} members.`
      );
    }
  };

  // Senior Team: Preserves numerical order 01 to 04
  checkDuplicatesAndOrder(seniorMembers, 'Senior Team', 4);

  // Junior Team: Sorted alphabetically by first name (case-insensitive A to Z) as required by Part 6
  juniorMembers.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  juniorMembers.forEach((m, idx) => {
    m.order = idx + 1;
    m.isAmbiguous = false;
  });

  if (juniorMembers.length < 6) {
    ambiguities.push(
      `Junior Team currently has ${juniorMembers.length} members loaded, but the fixed structure expects 6 members.`
    );
  }

  return {
    fullTeamPhoto,
    seniorTeam: seniorMembers,
    juniorTeam: juniorMembers,
    ambiguities,
  };
}
