from werkzeug.security import generate_password_hash, check_password_hash

password = 'admin123'
hashed = generate_password_hash(password)
print(f"Hashed: {hashed}")
match = check_password_hash(hashed, password)
print(f"Match: {match}")
