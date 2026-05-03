from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, current_user
from models import db, Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    
    return jsonify([{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at
    } for n in notifications]), 200

@notifications_bp.route('/<int:notification_id>/read', methods=['PATCH'])
@jwt_required()
def mark_as_read(notification_id):
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first_or_404()
    notification.is_read = True
    db.session.commit()
    
    return jsonify({"msg": "Notification marked as read"}), 200

@notifications_bp.route('/read_all', methods=['PATCH'])
@jwt_required()
def mark_all_as_read():
    notifications = Notification.query.filter_by(user_id=current_user.id, is_read=False).all()
    for n in notifications:
        n.is_read = True
    db.session.commit()
    
    return jsonify({"msg": "All notifications marked as read"}), 200
