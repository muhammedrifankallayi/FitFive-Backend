const mongoose = require('mongoose');
const uri = "mongodb+srv://thefitfiveapparels_db_user:PRIOFDkl97rCsNKp@cluster0.p8cggpv.mongodb.net/thefitfive";

const itemSchema = new mongoose.Schema({
    name: String,
    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Size' }],
    colors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color' }]
});
const Item = mongoose.model('Item', itemSchema);

const sizeSchema = new mongoose.Schema({ name: String, code: String });
const Size = mongoose.model('Size', sizeSchema);

const colorSchema = new mongoose.Schema({ name: String, hex: String });
const Color = mongoose.model('Color', colorSchema);


mongoose.connect(uri).then(async () => {
    console.log("Connected");
    try {
        const items = await Item.find().populate('sizes').populate('colors').limit(5).lean();
        console.log("Found items:", items.length);
        if (items.length > 0) {
            console.log("First item:", JSON.stringify(items[0], null, 2));
            console.log("Sizes present directly?", items[0].sizes && items[0].sizes.length > 0);
        } else {
            console.log("No items found.");
        }

        const sizes = await Size.find().limit(5);
        console.log("All Sizes found:", sizes);

        const colors = await Color.find().limit(5);
        console.log("All Colors found:", colors);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
});
