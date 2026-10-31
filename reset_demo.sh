#!/usr/bin/env bash
# ==============================================================================
# Reset Synthetic Demo Database to Fresh State
# Rebuilds database tables and seeds demo institutions, rules, cases & students
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
BACKEND_DIR="$DIR/SIH-backend"

echo "[*] Resetting AICTE APAAR Ledger database..."

cd "$BACKEND_DIR"
rm -f aicte_ledger.db

"$BACKEND_DIR/.venv/bin/python" -c "
from app.db.database import SessionLocal, Base, engine
import app.db.models
from app.db.seed import seed_database, ensure_extended_seed

print('Recreating tables...')
Base.metadata.create_all(bind=engine)
seed_database(force=True)

db = SessionLocal()
ensure_extended_seed(db)
db.close()
print('Database successfully reset and re-seeded with fresh demo records!')
"

echo "==================================================================="
echo "  Fresh demo dataset is ready for evaluation!"
echo "==================================================================="
