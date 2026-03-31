"""add temple notifications

Revision ID: add_temple_notifications
Revises: line_001
Create Date: 2026-03-30

"""
from alembic import op
import sqlalchemy as sa

revision = 'add_temple_notifications'
down_revision = 'line_001'
branch_labels = None
depends_on = None


def upgrade():
    # 廟方通知主表
    op.create_table(
        'temple_notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('temple_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('channels', sa.JSON(), nullable=True),
        sa.Column('target_audience', sa.String(30), nullable=False, server_default='all'),
        sa.Column('target_event_id', sa.Integer(), nullable=True),
        sa.Column('target_filters', sa.JSON(), nullable=True),
        sa.Column('target_count', sa.Integer(), server_default='0'),
        sa.Column('sent_count', sa.Integer(), server_default='0'),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='draft'),
        sa.Column('scheduled_at', sa.DateTime(), nullable=True),
        sa.Column('sent_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['temple_id'], ['temples.id']),
        sa.ForeignKeyConstraint(['target_event_id'], ['temple_events.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_temple_notifications_temple_id', 'temple_notifications', ['temple_id'])
    op.create_index('ix_temple_notifications_status', 'temple_notifications', ['status'])
    op.create_index('ix_temple_notifications_scheduled_at', 'temple_notifications', ['scheduled_at'])

    # 通知統計表（per channel）
    op.create_table(
        'notification_stats',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('notification_id', sa.Integer(), nullable=False),
        sa.Column('channel', sa.String(10), nullable=False),
        sa.Column('sent', sa.Integer(), server_default='0'),
        sa.Column('opened', sa.Integer(), server_default='0'),
        sa.Column('clicked', sa.Integer(), server_default='0'),
        sa.ForeignKeyConstraint(['notification_id'], ['temple_notifications.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_notification_stats_notification_id', 'notification_stats', ['notification_id'])

    # 通知模板表
    op.create_table(
        'notification_templates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('temple_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('category', sa.String(20), nullable=False, server_default='custom'),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_default', sa.Boolean(), server_default='0'),
        sa.Column('usage_count', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['temple_id'], ['temples.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_notification_templates_temple_id', 'notification_templates', ['temple_id'])


def downgrade():
    op.drop_table('notification_templates')
    op.drop_table('notification_stats')
    op.drop_table('temple_notifications')
