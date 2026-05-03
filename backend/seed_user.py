from app import create_app
from models import db, User, Role
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

def seed_admin():
    app = create_app()
    with app.app_context():
        role = Role.query.filter_by(role_name='admin').first()
        if not User.query.filter_by(email='admin@helpdeskpro.com').first():
            admin = User(
                name='Admin User',
                email='admin@helpdeskpro.com',
                password_hash=generate_password_hash('admin123'),
                role_id=role.id
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: admin@helpdeskpro.com / admin123")
        else:
            print("Admin user already exists.")

if __name__ == '__main__':
    seed_admin()
