from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from models import db, Ticket, SLATracking, Priority, Status, User, Comment, TicketHistory, Notification, Role
from datetime import datetime, timedelta

tickets_bp = Blueprint('tickets', __name__)

@tickets_bp.route('/', methods=['POST'])
@jwt_required()
def create_ticket():
    if current_user.role.role_name != 'customer':
        return jsonify({"msg": "Only customers can create tickets"}), 403
    
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    category = data.get('category')
    priority_id = data.get('priority_id')
    
    # Get status 'Open'
    open_status = Status.query.filter_by(status_name='Open').first()
    
    new_ticket = Ticket(
        title=title,
        description=description,
        category=category,
        customer_id=current_user.id,
        priority_id=priority_id,
        status_id=open_status.id
    )
    
    db.session.add(new_ticket)
    db.session.flush() # To get the ticket ID
    
    # Calculate SLA due time
    priority = Priority.query.get(priority_id)
    due_time = datetime.utcnow() + timedelta(hours=priority.sla_hours)
    
    sla_track = SLATracking(
        ticket_id=new_ticket.id,
        due_time=due_time,
        sla_status='Pending'
    )
    
    db.session.add(sla_track)
    
    # Log History
    history = TicketHistory(
        ticket_id=new_ticket.id,
        user_id=current_user.id,
        action="Ticket created"
    )
    db.session.add(history)
    
    # Notify Admins
    admins = User.query.join(Role).filter(Role.role_name == 'admin').all()
    for admin in admins:
        admin_notif = Notification(
            user_id=admin.id,
            title="New Ticket Raised",
            message=f"A new ticket #{new_ticket.id} '{title}' was raised by {current_user.name}."
        )
        db.session.add(admin_notif)
    
    db.session.commit()
    
    return jsonify({"msg": "Ticket created successfully", "ticket_id": new_ticket.id}), 201

@tickets_bp.route('/', methods=['GET'])
@jwt_required()
def get_tickets():
    query = Ticket.query
    
    if current_user.role.role_name == 'customer':
        query = query.filter_by(customer_id=current_user.id)
    elif current_user.role.role_name == 'agent':
        query = query.filter_by(agent_id=current_user.id)
        
    tickets = query.all()
    output = []
    for t in tickets:
        output.append({
            "id": t.id,
            "title": t.title,
            "status": t.status.status_name,
            "priority": t.priority.priority_name,
            "category": t.category,
            "created_at": t.created_at,
            "customer_name": t.customer.name,
            "agent_name": t.agent.name if t.agent else "Unassigned",
            "due_time": t.sla_info.due_time if t.sla_info else None,
            "sla_status": t.sla_info.sla_status if t.sla_info else None
        })
    return jsonify(output), 200

@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket_details(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Authorization check
    if current_user.role.role_name == 'customer' and ticket.customer_id != current_user.id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    comments = []
    for c in ticket.comments:
        comments.append({
            "id": c.id,
            "user_name": c.user.name,
            "role": c.user.role.role_name,
            "message": c.message,
            "created_at": c.created_at
        })
        
    history_logs = TicketHistory.query.filter_by(ticket_id=ticket.id).order_by(TicketHistory.created_at.desc()).all()
    history_data = [{"user": h.user.name, "action": h.action, "time": h.created_at} for h in history_logs]

    return jsonify({
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "category": ticket.category,
        "status": ticket.status.status_name,
        "priority": ticket.priority.priority_name,
        "customer": ticket.customer.name,
        "agent": ticket.agent.name if ticket.agent else None,
        "created_at": ticket.created_at,
        "due_time": ticket.sla_info.due_time if ticket.sla_info else None,
        "sla_status": ticket.sla_info.sla_status if ticket.sla_info else None,
        "comments": comments,
        "history": history_data
    }), 200

@tickets_bp.route('/<int:ticket_id>/status', methods=['PATCH'])
@jwt_required()
def update_status(ticket_id):
    if current_user.role.role_name not in ['agent', 'admin']:
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    status_name = data.get('status')
    
    ticket = Ticket.query.get_or_404(ticket_id)
    new_status = Status.query.filter_by(status_name=status_name).first()
    
    if not new_status:
        return jsonify({"msg": "Invalid status"}), 400
    
    ticket.status_id = new_status.id
    
    # Log History
    history = TicketHistory(
        ticket_id=ticket.id,
        user_id=current_user.id,
        action=f"Status changed to {status_name}"
    )
    db.session.add(history)
    
    # Logic for Resolved
    if status_name == 'Resolved':
        sla = SLATracking.query.filter_by(ticket_id=ticket_id).first()
        if sla:
            sla.resolution_time = datetime.utcnow()
            if sla.resolution_time <= sla.due_time:
                sla.sla_status = 'Hit'
            else:
                sla.sla_status = 'Breached'
                
    # Create Notification for Customer
    notification = Notification(
        user_id=ticket.customer_id,
        title="Ticket Status Updated",
        message=f"Your ticket #{ticket.id} status was changed to {status_name}."
    )
    db.session.add(notification)
    
    if status_name == 'Resolved':
        admins = User.query.join(Role).filter(Role.role_name == 'admin').all()
        for admin in admins:
            admin_notif = Notification(
                user_id=admin.id,
                title="Ticket Resolved",
                message=f"Ticket #{ticket.id} was resolved by {current_user.name}."
            )
            db.session.add(admin_notif)
    
    db.session.commit()
    return jsonify({"msg": f"Ticket status updated to {status_name}"}), 200

@tickets_bp.route('/<int:ticket_id>/assign', methods=['PATCH'])
@jwt_required()
def assign_ticket(ticket_id):
    if current_user.role.role_name != 'admin':
        return jsonify({"msg": "Unauthorized. Only admins can assign tickets."}), 403
    
    data = request.get_json()
    agent_id = data.get('agent_id')
    if not agent_id:
        return jsonify({"msg": "Agent ID is required"}), 400
        
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.agent_id = agent_id 
    
    agent = User.query.get(agent_id)
    
    # Log History
    history = TicketHistory(
        ticket_id=ticket.id,
        user_id=current_user.id,
        action=f"Ticket assigned to {agent.name}"
    )
    db.session.add(history)
    
    # Create Notification for Customer
    notification = Notification(
        user_id=ticket.customer_id,
        title="Agent Assigned",
        message=f"Your ticket #{ticket.id} has been assigned to {agent.name}."
    )
    db.session.add(notification)
    
    # Create Notification for Agent
    agent_notif = Notification(
        user_id=agent.id,
        title="New Ticket Assigned",
        message=f"You have been assigned ticket #{ticket.id}."
    )
    db.session.add(agent_notif)
    
    db.session.commit()
    return jsonify({"msg": f"Ticket assigned to {agent.name}"}), 200

@tickets_bp.route('/<int:ticket_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(ticket_id):
    data = request.get_json()
    new_comment = Comment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=data.get('message')
    )
    
    db.session.add(new_comment)
    
    # Notifications
    ticket = Ticket.query.get(ticket_id)
    if current_user.id == ticket.customer_id:
        # Notify agent if assigned
        if ticket.agent_id:
            notification = Notification(
                user_id=ticket.agent_id,
                title="New Comment from Customer",
                message=f"A new comment was added to ticket #{ticket.id}."
            )
            db.session.add(notification)
    else:
        # Notify customer
        notification = Notification(
            user_id=ticket.customer_id,
            title="New Reply",
            message=f"An agent replied to your ticket #{ticket.id}."
        )
        db.session.add(notification)

    db.session.commit()
    return jsonify({"msg": "Comment added"}), 201
