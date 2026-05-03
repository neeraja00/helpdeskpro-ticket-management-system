import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from models import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Initialize Extensions
    db.init_app(app)
    CORS(app)
    
    # Register Blueprints
    from routes.auth import auth_bp
    from routes.tickets import tickets_bp
    from routes.dashboard import dashboard_bp
    from routes.admin import admin_bp
    from routes.notifications import notifications_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    jwt = JWTManager(app)
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        # If user is a dict (from login), return the ID as string
        if isinstance(user, dict):
            return str(user.get('id'))
        # Otherwise assume it's the user object or ID
        val = getattr(user, 'id', user)
        return str(val)

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        from models import User
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"DEBUG: Invalid token error: {error}")
        return jsonify({
            "msg": "Invalid token",
            "error": str(error),
            "suggestion": "Please try logging out and logging in again."
        }), 422

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"DEBUG: Missing Authorization header: {error}")
        return jsonify({"msg": "Missing Authorization header", "error": error}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print("DEBUG: Token expired")
        return jsonify({"msg": "Token expired"}), 401
    
    @app.route('/')
    def index():
        return jsonify({"message": "Welcome to HelpDeskPro API"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
