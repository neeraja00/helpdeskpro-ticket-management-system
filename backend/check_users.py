from app import create_app
from models import db, User, Role

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"ID: {user.id}, Name: {user.name}, Email: {user.email}, Role: {user.role.role_name}, Hash: {user.password_hash}")
