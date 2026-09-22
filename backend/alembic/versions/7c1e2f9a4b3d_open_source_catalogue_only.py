"""open-source release: drop accounts, plans, quotas and server history

The API now only serves the public fingerprint catalogue; everything
user-related lives in the browser. The catalogue gains a ``translations``
column (French wording of its text fields).

Revision ID: 7c1e2f9a4b3d
Revises: 38ac89a5253a
Create Date: 2026-09-22 10:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '7c1e2f9a4b3d'
down_revision: str | None = '38ac89a5253a'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Children before parents (FKs to users).
_DROPPED = (
    'analyses',
    'oauth_accounts',
    'oauth_exchange_codes',
    'refresh_tokens',
    'user_settings',
    'users',
    'magic_links',
    'anon_sessions',
    'quota_windows',
    'scan_events',
)


def upgrade() -> None:
    for table in _DROPPED:
        op.execute(f'DROP TABLE IF EXISTS {table}')

    with op.batch_alter_table('fingerprints', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('translations', sa.JSON(), nullable=False, server_default='{}')
        )


def downgrade() -> None:
    raise NotImplementedError(
        'Irreversible: account/quota tables were removed. Restore from a backup, '
        'or check out a revision before 7c1e2f9a4b3d and re-run its migrations.'
    )
