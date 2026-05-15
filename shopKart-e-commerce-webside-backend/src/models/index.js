const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]; // Your DB connection
// console.log("ENV:", env);

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
const db = {};

// 1. Import and Initialize
db.User = require('./user.model')(sequelize, Sequelize.DataTypes);
db.Category = require('./category.model')(sequelize, Sequelize.DataTypes);
db.SubCategory = require('./subCategory.model')(sequelize, Sequelize.DataTypes);;
db.Product = require('./product.model')(sequelize, Sequelize.DataTypes);
db.Filter = require('./filter.model')(sequelize, Sequelize.DataTypes);
db.FilterValue = require('./filterValue.model')(sequelize, Sequelize.DataTypes);
db.ProductFilter = require('./productFilter.model')(sequelize, Sequelize.DataTypes);
db.Cart = require('./cart.model')(sequelize, Sequelize.DataTypes);
db.CartItem = require('./cartItem.model')(sequelize, Sequelize.DataTypes);
db.Order = require('./order.model')(sequelize, Sequelize.DataTypes);
db.OrderItem = require('./orderItem.model')(sequelize, Sequelize.DataTypes);

// 2. Run Associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;


// console.log("CONFIG:", config);

module.exports = db;




// const User = require('./user.model');
// const Category = require('./category.model');
// const SubCategory = require('./subCategory.model');
// const Product = require('./product.model');
// const Filter = require('./filter.model');
// const FilterValue = require('./filterValue.model');
// const ProductFilter = require('./productFilter.model');
// const Cart = require('./cart.model');
// const CartItem = require('./cartItem.model');
// const Order = require('./order.model');
// const OrderItem = require('./orderItem.model');

// User -> Product (seller)
// User.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
// Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// // Category hierarchy (parent -> children)
// Category.belongsTo(Category, {
//   foreignKey: 'parent_category_id',
//   as: 'parent',
// });
// Category.hasMany(Category, {
//   foreignKey: 'parent_category_id',
//   as: 'children',
// });

// // Category -> SubCategory
// Category.hasMany(SubCategory, {
//   foreignKey: 'category_id',
//   as: 'subCategories',
// });
// SubCategory.belongsTo(Category, {
//   foreignKey: 'category_id',
//   as: 'category',
// });

// // SubCategory -> Product
// SubCategory.hasMany(Product, {
//   foreignKey: 'subcategory_id',
//   as: 'products',
// });
// Product.belongsTo(SubCategory, {
//   foreignKey: 'subcategory_id',
//   as: 'subCategory',
// });

// // Category/SubCategory -> Filter (dynamic by scope)
// Category.hasMany(Filter, {
//   foreignKey: 'category_id',
//   as: 'filters',
// });
// Filter.belongsTo(Category, {
//   foreignKey: 'category_id',
//   as: 'category',
// });

// SubCategory.hasMany(Filter, {
//   foreignKey: 'subcategory_id',
//   as: 'filters',
// });
// Filter.belongsTo(SubCategory, {
//   foreignKey: 'subcategory_id',
//   as: 'subCategory',
// });

// // Filter -> FilterValue
// Filter.hasMany(FilterValue, {
//   foreignKey: 'filter_id',
//   as: 'values',
// });
// FilterValue.belongsTo(Filter, {
//   foreignKey: 'filter_id',
//   as: 'filter',
// });

// // Product <-> Filter (via ProductFilter)
// Product.belongsToMany(Filter, {
//   through: ProductFilter,
//   foreignKey: 'product_id',
//   otherKey: 'filter_id',
//   as: 'filters',
// });
// Filter.belongsToMany(Product, {
//   through: ProductFilter,
//   foreignKey: 'filter_id',
//   otherKey: 'product_id',
//   as: 'products',
// });

// ProductFilter.belongsTo(Product, {
//   foreignKey: 'product_id',
//   as: 'product',
// });
// ProductFilter.belongsTo(Filter, {
//   foreignKey: 'filter_id',
//   as: 'filter',
// });
// ProductFilter.belongsTo(FilterValue, {
//   foreignKey: 'filter_value_id',
//   as: 'filterValue',
// });

// // User -> Cart
// User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
// Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// // Cart -> CartItem
// Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
// CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
// CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// // User -> Order
// User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
// Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// // Order -> OrderItem
// Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
// OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
// OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// module.exports = db;

// {
//   User,
//   Category,
//   SubCategory,
//   Product,
//   Filter,
//   FilterValue,
//   ProductFilter,
//   Cart,
//   CartItem,
//   Order,
//   OrderItem,
// };
