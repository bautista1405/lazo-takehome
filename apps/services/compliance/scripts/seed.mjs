/**
 * Seeds the compliance API with realistic Delaware obligations through the
 * public HTTP contract, so state transitions also build a real audit trail.
 *
 * Usage: API_URL=https://compliance-api.onrender.com node scripts/seed.mjs
 * Defaults to http://localhost:3002. Skips seeding when data already exists.
 */

const API_URL = (process.env.API_URL ?? 'http://localhost:3002').replace(
  /\/$/,
  '',
);

const seeds = [
  {
    obligation: {
      type: 'annual_report',
      title: 'Delaware Annual Report 2025',
      description:
        'File the 2025 annual report with the Delaware Division of Corporations.',
      dueDate: '2026-03-01',
      owner: 'Legal Ops',
      requiresDocument: true,
      documentUrl: 'https://example.com/documents/annual-report-2025.pdf',
      companyTaxId: '83-1927465',
    },
    statusPath: ['in_progress', 'submitted', 'done'],
  },
  {
    obligation: {
      type: 'franchise_tax',
      title: 'Delaware Franchise Tax 2026',
      description:
        'Pay the annual franchise tax owed by the corporation to the State of Delaware.',
      dueDate: '2026-06-01',
      owner: 'Finance',
      requiresDocument: false,
      documentUrl: null,
      companyTaxId: '83-1927465',
    },
    statusPath: ['in_progress'],
  },
  {
    obligation: {
      type: 'boi_report',
      title: 'FinCEN BOI Report Update',
      description:
        'Report the beneficial ownership change to FinCEN within the 30-day window.',
      dueDate: '2026-07-15',
      owner: 'Legal Ops',
      requiresDocument: true,
      documentUrl: 'https://example.com/documents/boi-update.pdf',
      companyTaxId: '83-1927465',
    },
    statusPath: ['in_progress', 'submitted'],
  },
  {
    obligation: {
      type: 'franchise_tax',
      title: 'Franchise Tax Q2 Estimated Payment',
      description:
        'Large corporate filer quarterly estimated franchise tax payment.',
      dueDate: '2026-06-20',
      owner: 'Finance',
      requiresDocument: true,
      documentUrl: null,
      companyTaxId: '83-1927465',
    },
    statusPath: ['in_progress'],
  },
  {
    obligation: {
      type: 'annual_report',
      title: 'Annual Report — Subsidiary LLC',
      description:
        'Prepare and file the annual report for the wholly owned subsidiary.',
      dueDate: '2026-08-15',
      owner: 'Legal Ops',
      requiresDocument: true,
      documentUrl: null,
      companyTaxId: '87-5551234',
    },
    statusPath: [],
  },
  {
    obligation: {
      type: 'registered_agent_renewal',
      title: 'Registered Agent Renewal',
      description:
        'Renew the Delaware registered agent service before it lapses.',
      dueDate: '2026-09-30',
      owner: 'Operations',
      requiresDocument: false,
      documentUrl: null,
      companyTaxId: '87-5551234',
    },
    statusPath: [],
  },
];

async function request(path, init = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  if (!response.ok) {
    throw new Error(
      `${init.method ?? 'GET'} ${path} failed (${response.status}): ${await response.text()}`,
    );
  }

  return response.json();
}

async function main() {
  const existing = await request('/obligation');

  if (existing.length > 0) {
    console.log(
      `Skipping seed: ${existing.length} obligations already exist at ${API_URL}.`,
    );
    return;
  }

  for (const { obligation, statusPath } of seeds) {
    const created = await request('/obligation', {
      method: 'POST',
      body: JSON.stringify(obligation),
    });

    let version = created.version;

    for (const status of statusPath) {
      const updated = await request(`/obligation/${created.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, expectedVersion: version }),
      });

      version = updated.version;
    }

    console.log(
      `Seeded "${obligation.title}" (${statusPath.at(-1) ?? 'pending'})`,
    );
  }

  console.log(`Done: ${seeds.length} obligations seeded at ${API_URL}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
