from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from models import db, User, Role

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role', 'customer')
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400
    
    role = Role.query.filter_by(role_name=role_name).first()
    if not role:
        return jsonify({"msg": "Invalid role"}), 400
    
    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=hashed_password, role_id=role.id)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    requested_role = data.get('role')
    
    print(f"DEBUG: Login attempt for email: '{email}', role: '{requested_role}'")
    
    user = User.query.filter_by(email=email).first()
    if not user:
        print(f"DEBUG: User not found: '{email}'")
        return jsonify({"msg": "Invalid credentials"}), 401
        
    if requested_role and user.role.role_name != requested_role:
        print(f"DEBUG: Role mismatch. Expected {user.role.role_name}, got {requested_role}")
        return jsonify({"msg": f"Access denied. You cannot log in as an {requested_role}."}), 401
        
    if not check_password_hash(user.password_hash, password):
        print(f"DEBUG: Password mismatch for user: '{email}'")
        return jsonify({"msg": "Invalid credentials"}), 401
    
    access_token = create_access_token(
        identity=str(user.id), 
        additional_claims={
            "role": user.role.role_name, 
            "name": user.name
        }
    )
    return jsonify(access_token=access_token), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user = get_jwt_identity()
    return jsonify(current_user), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if email and email != user.email:
        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "Email already in use"}), 400
        user.email = email
        
    if name:
        user.name = name
        
    if password:
        user.password_hash = generate_password_hash(password)
        
    db.session.commit()
    return jsonify({
        "msg": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.role_name
        }
    }), 200
