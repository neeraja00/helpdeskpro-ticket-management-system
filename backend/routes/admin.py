from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from models import db, User, Role, Ticket, Status, Priority
from werkzeug.security import generate_password_hash

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role.role_name,
        "created_at": u.created_at
    } for u in users]), 200

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role', 'agent')
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400
        
    role = Role.query.filter_by(role_name=role_name).first()
    new_user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role_id=role.id
    )
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": f"User {name} created as {role_name}"}), 201

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
        
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({"msg": "Cannot delete yourself"}), 400
        
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "User deleted successfully"}), 200

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
        
    total_tickets = Ticket.query.count()
    resolved_tickets = Ticket.query.join(Status).filter(Status.status_name == 'Resolved').count()
    open_tickets = Ticket.query.join(Status).filter(Status.status_name == 'Open').count()
    
    # SLA Stats
    from models import SLATracking
    sla_breached = SLATracking.query.filter_by(sla_status='Breached').count()
    sla_hit = SLATracking.query.filter_by(sla_status='Hit').count()
    
    # Tickets by category
    categories = db.session.query(Ticket.category, db.func.count(Ticket.id)).group_by(Ticket.category).all()
    category_stats = [{"category": c[0], "count": c[1]} for c in categories]

    return jsonify({
        "total": total_tickets,
        "resolved": resolved_tickets,
        "open": open_tickets,
        "sla": {
            "breached": sla_breached,
            "hit": sla_hit
        },
        "categories": category_stats
    }), 200

@admin_bp.route('/sla-config', methods=['GET'])
@jwt_required()
def get_sla_config():
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
        
    priorities = Priority.query.all()
    return jsonify([{
        "id": p.id,
        "priority_name": p.priority_name,
        "sla_hours": p.sla_hours
    } for p in priorities]), 200

@admin_bp.route('/sla-config', methods=['PUT'])
@jwt_required()
def update_sla_config():
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
        
    data = request.get_json()
    updates = data.get('updates', []) # Expects [{'id': 1, 'sla_hours': 4}]
    
    for update in updates:
        priority = Priority.query.get(update['id'])
        if priority and 'sla_hours' in update:
            priority.sla_hours = int(update['sla_hours'])
            
    db.session.commit()
    return jsonify({"msg": "SLA configuration updated successfully"}), 200
