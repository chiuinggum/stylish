const { db } = require('../config');

class ImageModel {
    static async createImageRecords(images, product_id) {
        try {
            for(let image of images) {
                const [imageRow] = await db.query('INSERT INTO images (product_id, image) VALUES (?, ?)', [product_id, image]);
                console.log(`inserted: ${imageRow.insertId}, ${product_id}, ${image}`);
            }
        } catch (err) {
            console.log(err);
            throw new Error('Error inserting image');
        }
    };
    static async getImagesByProductId(product_id) {
        try {
            const [imageRows] = await db.query('SELECT * FROM images WHERE product_id = ?', [product_id]);
            if(imageRows.length === 0) {
                throw new Error('Image not found');
            }
            return imageRows;
        } catch(err) {
            throw err;
        }
    };
};

module.exports = ImageModel;