from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from models import db, Ticket, SLATracking, Status, Priority, User
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/agent-stats', methods=['GET'])
@jwt_required()
def agent_stats():
    if current_user.role.role_name != 'agent':
        return jsonify({"msg": "Unauthorized"}), 403
    
    agent_id = current_user.id
    
    # SQL: Count tickets by status for assigned agent
    status_counts = db.session.query(Status.status_name, func.count(Ticket.id))\
        .join(Ticket, Ticket.status_id == Status.id)\
        .filter(Ticket.agent_id == agent_id)\
        .group_by(Status.status_name).all()
    
    # SQL: Count tickets by priority for assigned agent
    priority_counts = db.session.query(Priority.priority_name, func.count(Ticket.id))\
        .join(Ticket, Ticket.priority_id == Priority.id)\
        .filter(Ticket.agent_id == agent_id)\
        .group_by(Priority.priority_name).all()
    
    # Total Unassigned Open Tickets
    unassigned_count = Ticket.query.join(Status).filter(Status.status_name == 'Open', Ticket.agent_id == None).count()
    
    return jsonify({
        "by_status": dict(status_counts),
        "by_priority": dict(priority_counts),
        "unassigned_total": unassigned_count
    }), 200

@dashboard_bp.route('/admin-analytics', methods=['GET'])
@jwt_required()
def admin_analytics():
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    
    # 1. Breached SLA tickets
    breached_tickets = db.session.query(Ticket.id, Ticket.title, SLATracking.due_time)\
        .join(SLATracking, SLATracking.ticket_id == Ticket.id)\
        .filter(SLATracking.sla_status == 'Breached').all()
    
    # 2. Tickets resolved today
    today = func.date(func.now())
    resolved_today = db.session.query(func.count(Ticket.id))\
        .join(SLATracking, SLATracking.ticket_id == Ticket.id)\
        .filter(func.date(SLATracking.resolution_time) == today).scalar()
    
    # 3. Overall SLA Compliance Rate
    total_resolved = db.session.query(func.count(SLATracking.id))\
        .filter(SLATracking.sla_status.in_(['Hit', 'Breached'])).scalar() or 1 # avoid div by zero
    hit_count = db.session.query(func.count(SLATracking.id))\
        .filter(SLATracking.sla_status == 'Hit').scalar()
    
    compliance_rate = (hit_count / total_resolved) * 100
    
    return jsonify({
        "breached_tickets": [{"id": t.id, "title": t.title, "due_time": t.due_time} for t in breached_tickets],
        "resolved_today": resolved_today,
        "sla_compliance_rate": round(compliance_rate, 2)
    }), 200

@dashboard_bp.route('/search', methods=['GET'])
@jwt_required()
def search_tickets():
    # Placeholder for advanced search/filter logic
    # In a real app, this would use request.args.get() and dynamic filters
    return jsonify({"msg": "Search endpoint reached"}), 200
