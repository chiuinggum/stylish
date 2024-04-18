const { db } = require('../config');
const { getImagesByProductId } = require('./ImageModel');
const { getVariantByProductId } = require('./VariantModel');
const { getColorByCode } = require('./ColorModel');

class ProductModel {
    static async createProductRecords(product, main_image) {
        const { category, title, description, price, texture, wash, place, note, story } = product;
        try {
            const [productRow] = await db.query('INSERT INTO products (category, title, description, price, texture, wash, place, note, story, main_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [category, title, description, price, texture, wash, place, note, story, main_image]);
            console.log(`inserted: ${productRow.insertId}, ${title}`);
            return productRow.insertId;
        } catch (err) {
            throw new Error('Error inserting product');
        }
    };
    static async getProductById(id) {
        try {
            const [productRow] = await db.query('SELECT * FROM products WHERE id = ? AND is_deleted = ?', [id, false]);
            if(productRow.legnth === 0) {
                throw new Error('Product not found');
            }
            return productRow[0];
        } catch(err) {
            throw err;
        }
    };
    static async getAllProducts() {
        try {
            const [productRows] = await db.query('SELECT * FROM products WHERE is_deleted = ?', [false]);
            if(productRows.length === 0) {
                throw new Error('Product not found');
            }
            return productRows;
        } catch(err) {
            throw err;
        }
    };
    static async getProductsByKeyword(keyword, paging = 0) {
        try {
            const [productRows] = await db.query('SELECT * FROM products WHERE is_deleted = ? AND title LIKE ? LIMIT ?, 6', [false, `%${keyword}%`, paging * 6]);
            if(productRows.length === 0) {
                throw new Error('Product not found');
            }
            return productRows;
        } catch(err) {
            throw err;
        }
    };
    static async getProductByPageAndCategory(paging = 0, category = null) {
        try {
            const query = category
                ? 'SELECT * FROM products WHERE category = ? AND is_deleted = ? LIMIT ?, 6'
                : 'SELECT * FROM products WHERE is_deleted = ? LIMIT ?, 6';
            const queryParams = category
                ? [category, false, paging * 6]
                : [false, paging * 6, ];
            const [productRows] = await db.query(query, queryParams);
            if(productRows.length === 0) {
                throw new Error('Product not found');
            }
            return productRows;
        } catch(err) {
            throw err;
        }
    };
    static async getProductTotalNumber(category = '%', keyword = null) {
        try {
            const query = keyword
                ? 'SELECT COUNT(*) FROM products WHERE title LIKE ? AND is_deleted = ?'
                : 'SELECT COUNT(*) FROM products WHERE category LIKE ? AND is_deleted = ?';
            const queryParams = keyword
                ? [`%${keyword}%`, false]
                : [category, false];
            const [productRows] = await db.query(query, queryParams);
            if(productRows.length === 0) {
                throw new Error('Product not found');
            }
            return productRows[0]['COUNT(*)'];
        } catch(err) {
            throw err;
        }
    };
    static async formProductData(product, images, variants, colors) {
        const { id, category, title, description, price, texture, wash, place, note, story, main_image } = product;
        const sizes = [...new Set(variants.map(variant => variant.size))];
        return {
            id,
            category,
            title,
            description,
            price,
            texture,
            wash,
            place,
            note,
            story,
            colors: colors.map(color => ({
                code: color.code,
                name: color.name
            })),
            sizes,
            variants: variants.map(variant => ({
                color_code: variant.color_code,
                size: variant.size,
                stock: variant.stock
            })),
            main_image,
            images: images.map(image => image.image),
        }
    };
    static async formMultipleProductData(productRows) {
        return await Promise.all(productRows.map(async productRow => {
            const product_id = productRow.id;
            const [images, variants] = await Promise.all([
                getImagesByProductId(product_id),
                getVariantByProductId(product_id)
            ]);
            const colorPromise = variants.map(variant => getColorByCode(variant.color_code));
            const colors = await Promise.all(colorPromise);
            return await ProductModel.formProductData(productRow, images, variants, colors);
        }));
    };
    static async deletProductById(id) {
        try {
            const [productRow] = await db.query('UPDATE products SET is_deleted = ? WHERE id = ?', [true, id]);
            if(productRow.affectedRows === 0) {
                throw new Error('Product not found');
            }
            console.log(`deleted: ${id}`);
        } catch(err) {
            throw err;
        }
    };
    static async recoverProductById(id) {
        try {
            const [productRow] = await db.query('UPDATE products SET is_deleted = ? WHERE id = ?', [false, id]);
            if(productRow.affectedRows === 0) {
                throw new Error('Product not found');
            }
            console.log(`recovered: ${id}`);
        } catch(err) {
            throw err;
        }
    };
};

module.exports = ProductModel;