import sys
sys.path.insert(0, 'backend')

from app import create_app, db
from app.models import User, Product

app = create_app()
with app.app_context():
    user = User.query.filter_by(email='test@example.com').first()
    if user:
        user.set_password('password123')
        user.blessing_points = 1000
        user.role = 'admin'
        print('OK: User updated')

    if Product.query.count() == 0:
        products = [
            Product(name='Charm', category='charm', merit_points=100, stock_quantity=50, is_featured=True),
            Product(name='T-shirt', category='tshirt', merit_points=300, stock_quantity=30),
            Product(name='Sticker', category='sticker', merit_points=50, stock_quantity=100, is_featured=True)
        ]
        for p in products:
            db.session.add(p)
        print('OK: Products added')

    db.session.commit()
    print('DONE')
