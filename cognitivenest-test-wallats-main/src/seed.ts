const BASE = 'http://localhost:3000';

const USERS = [
  { username: 'alice',   email: 'alice@example.com',   balance: 1000 },
  { username: 'bob',     email: 'bob@example.com',     balance: 500  },
  { username: 'charlie', email: 'charlie@example.com', balance: 250  },
  { username: 'diana',   email: 'diana@example.com',   balance: 750  },
];

async function post(path: string, body: object): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

async function seed() {
  console.log('\n🌱  Starting seed...\n');

  try {
    await get('/users');
  } catch {
    console.error('❌  Cannot reach server at http://localhost:3000');
    console.error('    Make sure the app is running first:  npm run start:dev\n');
    process.exit(1);
  }

  const created: Array<{ id: string; username: string }> = [];

  for (const u of USERS) {
    const user = await post('/users', { username: u.username, email: u.email });

    if (user.id) {
      created.push({ id: user.id, username: u.username });
      console.log(`✅  Created user   : ${u.username} (${user.id})`);
    } else {
      const all = await get('/users');
      const existing = all.find((x: any) => x.username === u.username);
      if (existing) {
        created.push({ id: existing.id, username: u.username });
        console.log(`⚠️   Already exists : ${u.username} (${existing.id})`);
      } else {
        console.log(`❌  Failed         : ${u.username} — ${user.message}`);
        continue;
      }
    }
  }

  console.log('');

  for (let i = 0; i < created.length; i++) {
    const { id, username } = created[i];
    const balance = USERS[i].balance;
    const wallet = await post(`/wallets/${id}/add-balance`, { amount: balance });

    if (wallet.balance !== undefined) {
      console.log(`💰  Funded wallet   : ${username}  →  $${Number(wallet.balance).toFixed(2)}`);
    } else {
      console.log(`❌  Add balance failed for ${username}: ${wallet.message}`);
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log('✅  Seed complete!');
  console.log('─────────────────────────────────────\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
