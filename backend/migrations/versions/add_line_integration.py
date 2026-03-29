"""add LINE integration - line_users table and event_registrations columns

Revision ID: line_001
Revises: f8d1e2c3b4a5
Create Date: 2026-03-29
"""
from alembic import op
import sqlalchemy as sa

revision = 'line_001'
down_revision = 'f8d1e2c3b4a5'
branch_labels = None
depends_on = None


def upgrade():
    # 建立 line_users 表
    op.create_table(
        'line_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('line_user_id', sa.String(50), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=True),
        sa.Column('picture_url', sa.String(500), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('email', sa.String(120), nullable=True),
        sa.Column('is_following', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('followed_at', sa.DateTime(), nullable=True),
        sa.Column('unfollowed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('line_user_id'),
    )
    op.create_index('idx_line_users_line_user_id', 'line_users', ['line_user_id'])

    # event_registrations 新增欄位
    op.add_column('event_registrations',
        sa.Column('line_user_id', sa.String(50), nullable=True))
    op.add_column('event_registrations',
        sa.Column('people_count', sa.Integer(), nullable=False, server_default='1'))
    op.create_index('idx_reg_line_uid', 'event_registrations', ['line_user_id'])


def downgrade():
    op.drop_index('idx_reg_line_uid', 'event_registrations')
    op.drop_column('event_registrations', 'people_count')
    op.drop_column('event_registrations', 'line_user_id')
    op.drop_index('idx_line_users_line_user_id', 'line_users')
    op.drop_table('line_users')
