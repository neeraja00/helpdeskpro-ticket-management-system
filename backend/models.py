from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

db = SQLAlchemy()

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)
    users = db.relationship('User', backref='role', lazy=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tickets_created = db.relationship('Ticket', foreign_keys='Ticket.customer_id', backref='customer', lazy=True)
    tickets_assigned = db.relationship('Ticket', foreign_keys='Ticket.agent_id', backref='agent', lazy=True)

class Priority(db.Model):
    __tablename__ = 'priorities'
    id = db.Column(db.Integer, primary_key=True)
    priority_name = db.Column(db.String(50), unique=True, nullable=False)
    sla_hours = db.Column(db.Integer, nullable=False)
    tickets = db.relationship('Ticket', backref='priority', lazy=True)

class Status(db.Model):
    __tablename__ = 'statuses'
    id = db.Column(db.Integer, primary_key=True)
    status_name = db.Column(db.String(50), unique=True, nullable=False)
    tickets = db.relationship('Ticket', backref='status', lazy=True)

class Ticket(db.Model):
    __tablename__ = 'tickets'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    priority_id = db.Column(db.Integer, db.ForeignKey('priorities.id'), nullable=False)
    status_id = db.Column(db.Integer, db.ForeignKey('statuses.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    sla_info = db.relationship('SLATracking', backref='ticket', uselist=False, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='ticket', lazy=True, cascade="all, delete-orphan")
    history = db.relationship('TicketHistory', backref='ticket', lazy=True, cascade="all, delete-orphan")

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='comments')

class SLATracking(db.Model):
    __tablename__ = 'sla_tracking'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    due_time = db.Column(db.DateTime, nullable=False)
    resolution_time = db.Column(db.DateTime, nullable=True)
    sla_status = db.Column(db.Enum('Hit', 'Breached', 'Pending'), default='Pending')

class TicketHistory(db.Model):
    __tablename__ = 'ticket_history'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Who made the change
    action = db.Column(db.String(255), nullable=False) # e.g., 'Status changed to In Progress', 'Assigned to Agent X'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='history_entries')

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications')
