const { db } = require('../config');

class VariantModel {
    static async createVariantRecords(variants, product_id) {
        try {
            for(let variant of variants) {
                const { color_code, size, stock } = variant;
                const [variantRow] = await db.query('INSERT INTO variants (product_id, color_code, size, stock) VALUES (?, ?, ?, ?)', [product_id, color_code, size, stock]);
                console.log(`inserted: ${variantRow.insertId}, ${product_id}, ${color_code}, ${size}, ${stock}`);
            }
        } catch (err) {
            console.log(err);
            throw new Error('Error inserting variant');
        }
    };
    static async getVariantByProductId(product_id) {
        try {
            const [variantRows] = await db.query('SELECT * FROM variants WHERE product_id = ?', [product_id]);
            if(variantRows.length === 0) {
                throw new Error('Variant not found');
            }
            return variantRows;
        } catch(err) {
            throw err;
        }
    };
    static async getVariantByProductIdColorCodeAndSize(product_id, color_code, size) {
        try {
            const [variantRow] = await db.query('SELECT * FROM variants WHERE product_id = ? AND color_code = ? AND size = ?', [product_id, color_code, size]);
            if(variantRow.length === 0) {
                throw new Error('Variant not found');
            }
            return variantRow[0];
        } catch(err) {
            throw err;
        }
    };
};

module.exports = VariantModel;