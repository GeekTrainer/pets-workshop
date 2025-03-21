# filepath: server/app.py
import os
from flask import Flask, jsonify, request
from models import init_db, db, Dog, Breed
from flask_cors import CORS

# Get the server directory path
base_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(base_dir, "dogshelter.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for all routes with specific origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize the database with the app
init_db(app)

@app.route('/api/dogs', methods=['GET'])
def get_dogs():
    # Start with base query
    query = db.session.query(
        Dog.id, 
        Dog.name, 
        Breed.name.label('breed')
    ).join(Breed, Dog.breed_id == Breed.id)
    
    # Apply filters based on query parameters
    breed = request.args.get('breed')
    if breed:
        query = query.filter(Breed.name == breed)
        
    status = request.args.get('status')
    if status == 'available':
        query = query.filter(Dog.status == 'AVAILABLE')
    
    dogs_query = query.all()
    
    # Convert the result to a list of dictionaries
    dogs_list = [
        {
            'id': dog.id,
            'name': dog.name,
            'breed': dog.breed
        }
        for dog in dogs_query
    ]
    
    return jsonify(dogs_list)

@app.route('/api/dogs/<int:id>', methods=['GET'])
def get_dog(id):
    # Query the specific dog by ID and join with breed to get breed name
    dog_query = db.session.query(
        Dog.id,
        Dog.name,
        Breed.name.label('breed'),
        Dog.age,
        Dog.description,
        Dog.gender,
        Dog.status
    ).join(Breed, Dog.breed_id == Breed.id).filter(Dog.id == id).first()
    
    # Return 404 if dog not found
    if not dog_query:
        return jsonify({"error": "Dog not found"}), 404
    
    # Convert the result to a dictionary
    dog = {
        'id': dog_query.id,
        'name': dog_query.name,
        'breed': dog_query.breed,
        'age': dog_query.age,
        'description': dog_query.description,
        'gender': dog_query.gender,
        'status': dog_query.status.name
    }
    
    return jsonify(dog)

# Route to get all breeds
@app.route('/api/breeds', methods=['GET'])
def get_breeds():
    # Query all breeds
    breeds_query = db.session.query(Breed.id, Breed.name).all()
    
    # Convert the result to a list of dictionaries
    breeds_list = [
        {
            'id': breed.id,
            'name': breed.name
        }
        for breed in breeds_query
    ]
    
    return jsonify(breeds_list)

if __name__ == '__main__':
    app.run(debug=True, port=5100) # Port 5100 to avoid macOS conflicts