import os
from app import create_app
from models import db, Role, Priority, Status
from dotenv import load_dotenv

load_dotenv()

def init_db():
    app = create_app()
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Seed Roles
        if not Role.query.first():
            roles = [Role(role_name=r) for r in ['customer', 'agent', 'admin']]
            db.session.bulk_save_objects(roles)
        
        # Seed Priorities
        if not Priority.query.first():
            priorities = [
                Priority(priority_name='Low', sla_hours=48),
                Priority(priority_name='Medium', sla_hours=24),
                Priority(priority_name='High', sla_hours=8),
                Priority(priority_name='Urgent', sla_hours=4)
            ]
            db.session.bulk_save_objects(priorities)
            
        # Seed Statuses
        if not Status.query.first():
            statuses = [Status(status_name=s) for s in ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed']]
            db.session.bulk_save_objects(statuses)
            
        db.session.commit()
        print("Database initialized and seeded successfully!")

if __name__ == '__main__':
    init_db()
