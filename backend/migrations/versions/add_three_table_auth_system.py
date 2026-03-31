"""add three-table auth system (public_users, temple_admin_users, super_admin_users)

Revision ID: auth_three_tables
Revises: add_temple_notifications
Create Date: 2026-03-31

"""
from alembic import op
import sqlalchemy as sa

revision = 'auth_three_tables'
down_revision = 'add_temple_notifications'
branch_labels = None
depends_on = None


def upgrade():
    # 建立 public_users 表（一般信眾）
    op.create_table(
        'public_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(120), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('blessing_points', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_public_users_email', 'public_users', ['email'], unique=True)
    op.create_index('ix_public_users_is_active', 'public_users', ['is_active'], unique=False)

    # 建立 temple_admin_users 表（廟方管理員）
    op.create_table(
        'temple_admin_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(120), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('temple_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['temple_id'], ['temples.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_temple_admin_users_email', 'temple_admin_users', ['email'], unique=True)
    op.create_index('ix_temple_admin_users_temple_id', 'temple_admin_users', ['temple_id'], unique=False)
    op.create_index('ix_temple_admin_users_is_active', 'temple_admin_users', ['is_active'], unique=False)

    # 建立 super_admin_users 表（系統管理員）
    op.create_table(
        'super_admin_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(120), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_super_admin_users_email', 'super_admin_users', ['email'], unique=True)
    op.create_index('ix_super_admin_users_is_active', 'super_admin_users', ['is_active'], unique=False)


def downgrade():
    op.drop_index('ix_super_admin_users_is_active', 'super_admin_users')
    op.drop_index('ix_super_admin_users_email', 'super_admin_users')
    op.drop_table('super_admin_users')

    op.drop_index('ix_temple_admin_users_is_active', 'temple_admin_users')
    op.drop_index('ix_temple_admin_users_temple_id', 'temple_admin_users')
    op.drop_index('ix_temple_admin_users_email', 'temple_admin_users')
    op.drop_table('temple_admin_users')

    op.drop_index('ix_public_users_is_active', 'public_users')
    op.drop_index('ix_public_users_email', 'public_users')
    op.drop_table('public_users')
