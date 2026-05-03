from app import create_app
from models import User
from werkzeug.security import check_password_hash

app = create_app()
with app.app_context():
    user = User.query.filter_by(email='admin@helpdeskpro.com').first()
    if user:
        print(f"User found: {user.name}")
        pw = 'admin123'
        if check_password_hash(user.password_hash, pw):
            print(f"Password '{pw}' is CORRECT")
        else:
            print(f"Password '{pw}' is INCORRECT")
    else:
        print("Admin user not found")
