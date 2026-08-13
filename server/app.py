import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": "*", 
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# 配置数据库和JWT密钥（实际生产环境中请使用环境变量）
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///mapdraw.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'mfprXq3g6HV2LhqdCdY7pnpuZNL6QPOkKVOaRgyXlcgYZVqMkAnlwmhvBdBDK3Ym')

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ==========================================
# 1. 数据库模型定义
# ==========================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True) # 支持嵌套
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_deleted = db.Column(db.Boolean, default=False) # 回收站标记
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    data = db.Column(db.Text, nullable=True) # 存储地图的 JSON 数据
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_deleted = db.Column(db.Boolean, default=False)
    is_starred = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FileVersion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'), nullable=False)
    data = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# 递归计算文件夹深度的辅助函数
def get_folder_depth(folder_id, current_depth=1):
    if current_depth >= 10:
        return current_depth
    folder = Project.query.get(folder_id)
    if folder and folder.parent_id:
        return get_folder_depth(folder.parent_id, current_depth + 1)
    return current_depth

# ==========================================
# 2. Auth: 用户注册、登录、修改密码
# ==========================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '用户名已存在'}), 400
    new_user = User(
        username=data['username'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': '注册成功'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        # 打印收到的请求数据，方便你在后端终端查看
        print("收到登录请求数据:", request.data)
        
        if not request.is_json:
            return jsonify({'error': '请求必须是 JSON 格式'}), 400
            
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': '用户名和密码不能为空'}), 400
            
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            access_token = create_access_token(identity=str(user.id))
            return jsonify({'token': access_token}), 200
            
        return jsonify({'error': '用户名或密码错误'}), 401
    except Exception as e:
        print("登录接口发生异常:", str(e))
        return jsonify({'error': f'服务器内部错误: {str(e)}'}), 500

@app.route('/api/auth/password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.json
    if check_password_hash(user.password_hash, data['old_password']):
        user.password_hash = generate_password_hash(data['new_password'])
        db.session.commit()
        return jsonify({'message': '密码修改成功'}), 200
    return jsonify({'error': '旧密码不正确'}), 400

# ==========================================
# 3. Project: 项目管理接口
# ==========================================

@app.route('/api/projects', methods=['GET', 'POST'])
@jwt_required()
def handle_projects():
    user_id = get_jwt_identity()
    if request.method == 'POST':
        data = request.json
        parent_id = data.get('parent_id')

        # 检查嵌套深度是否超过 10 层
        if parent_id:
            depth = get_folder_depth(parent_id)
            if depth >= 10:
                return jsonify({'error': '文件夹最多只能嵌套 10 层'}), 400

        new_project = Project(name=data['name'], parent_id=parent_id, user_id=user_id)
        db.session.add(new_project)
        db.session.commit()
        return jsonify({'id': new_project.id, 'name': new_project.name, 'parent_id': new_project.parent_id}), 201
    else:
        # 查询未删除的项目
        projects = Project.query.filter_by(user_id=user_id, is_deleted=False).all()
        return jsonify([{'id': p.id, 'name': p.name} for p in projects]), 200

@app.route('/api/projects/<int:project_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_or_delete_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first_or_404()
    
    if request.method == 'PUT':
        project.name = request.json.get('name', project.name)
        db.session.commit()
        return jsonify({'message': '项目已修改'})
        
    if request.method == 'DELETE':
        # 软删除：进入回收站
        project.is_deleted = True
        db.session.commit()
        return jsonify({'message': '项目已移入回收站'})

@app.route('/api/projects/<int:project_id>/restore', methods=['POST'])
@jwt_required()
def restore_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first_or_404()
    project.is_deleted = False
    db.session.commit()
    return jsonify({'message': '项目已移出回收站'})

@app.route('/api/projects/<int:project_id>/hard_delete', methods=['DELETE'])
@jwt_required()
def hard_delete_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first_or_404()
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': '项目已彻底删除'})

# ==========================================
# 4. File: 文件管理接口 (包含地图数据)
# ==========================================

@app.route('/api/files', methods=['GET', 'POST'])
@jwt_required()
def handle_files():
    user_id = get_jwt_identity()
    if request.method == 'POST':
        data = request.json
        new_file = File(
            name=data['name'], 
            data=json.dumps(data.get('data', {})),
            project_id=data.get('project_id'),
            user_id=user_id
        )
        db.session.add(new_file)
        db.session.commit()
        return jsonify({'id': new_file.id, 'name': new_file.name}), 201
    else:
        # 获取文件列表，支持传入 project_id 进行过滤
        project_id = request.args.get('project_id')
        query = File.query.filter_by(user_id=user_id, is_deleted=False)
        if project_id:
            query = query.filter_by(project_id=project_id)
        files = query.all()
        return jsonify([{'id': f.id, 'name': f.name, 'is_starred': f.is_starred} for f in files]), 200

@app.route('/api/files/<int:file_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_or_delete_file(file_id):
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first_or_404()
    
    if request.method == 'PUT':
        data = request.json
        file.name = data.get('name', file.name)
        if 'data' in data:
            file.data = json.dumps(data['data'])
        db.session.commit()
        return jsonify({'message': '文件已修改'})
        
    if request.method == 'DELETE':
        file.is_deleted = True # 软删除
        db.session.commit()
        return jsonify({'message': '文件已移入回收站'})

@app.route('/api/files/<int:file_id>/move', methods=['PUT'])
@jwt_required()
def move_file(file_id):
    # 将文件移入特定项目
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first_or_404()
    file.project_id = request.json.get('project_id')
    db.session.commit()
    return jsonify({'message': '文件已移动'})

@app.route('/api/files/<int:file_id>/star', methods=['PUT'])
@jwt_required()
def star_file(file_id):
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first_or_404()
    file.is_starred = not file.is_starred
    db.session.commit()
    return jsonify({'message': '文件标星状态已切换', 'is_starred': file.is_starred})

@app.route('/api/files/<int:file_id>/restore', methods=['POST'])
@jwt_required()
def restore_file(file_id):
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first_or_404()
    file.is_deleted = False
    db.session.commit()
    return jsonify({'message': '文件已移出回收站'})

@app.route('/api/files/<int:file_id>/hard_delete', methods=['DELETE'])
@jwt_required()
def hard_delete_file(file_id):
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first_or_404()
    db.session.delete(file)
    db.session.commit()
    return jsonify({'message': '文件已彻底删除'})

@app.route('/api/files/drafts', methods=['GET'])
@jwt_required()
def get_draft_files():
    user_id = get_jwt_identity()
    # 草稿箱定义：没有被移动到任何文件夹（project_id 为 None），且未被删除
    drafts = File.query.filter_by(user_id=user_id, project_id=None, is_deleted=False).all()
    return jsonify([{'id': f.id, 'name': f.name, 'is_starred': f.is_starred} for f in drafts]), 200

# ==========================================
# 5. File Versions: 文件版本控制记录
# ==========================================

@app.route('/api/files/<int:file_id>/versions', methods=['GET', 'POST'])
@jwt_required()
def handle_file_versions(file_id):
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first_or_404()
    
    if request.method == 'POST':
        # 自动将当前文件数据生成一个快照版本
        new_version = FileVersion(file_id=file.id, data=file.data)
        db.session.add(new_version)
        db.session.commit()
        return jsonify({'message': '版本已记录', 'version_id': new_version.id}), 201
    else:
        versions = FileVersion.query.filter_by(file_id=file.id).order_by(FileVersion.created_at.desc()).all()
        return jsonify([{'id': v.id, 'created_at': v.created_at.isoformat()} for v in versions]), 200

@app.route('/api/files/<int:file_id>/versions/<int:version_id>/restore', methods=['POST'])
@jwt_required()
def restore_file_version(file_id, version_id):
    user_id = get_jwt_identity()
    file = File.query.filter_by(id=file_id, user_id=user_id).first_or_404()
    version = FileVersion.query.filter_by(id=version_id, file_id=file.id).first_or_404()
    
    # 将文件数据恢复为该版本的快照
    file.data = version.data
    db.session.commit()
    return jsonify({'message': '已成功恢复至该版本'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # 首次运行自动创建数据库表
    app.run(debug=True, port=5001)